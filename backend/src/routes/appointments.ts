// Import necessary modules
import { Request, Response, Router } from "express";
import { getDB } from "../utils/connect";
import { sendEmail } from "../utils/email";
import moment from "moment";
import { ObjectId } from "mongodb";

const router = Router();

// Create appointment
const createAppointment = async (
  doctorId: string,
  appointmentInfo,
  assistant = false
) => {
  try {
    if (!appointmentInfo) {
      throw new Error("Invalid appointment data");
    }
    appointmentInfo.doctorId = doctorId;
    appointmentInfo.date = moment(appointmentInfo.date).format("YYYY-MM-DD");
    appointmentInfo.status = "pending";
    const db = await getDB();
    const appointmentCollection = db.collection("appointments");
    const existingAppointment = await appointmentCollection.findOne({
      doctorId: appointmentInfo.doctorId,
      date: appointmentInfo.date,
      time: {
        $lte: moment(appointmentInfo.time)
          .add(appointmentInfo.duration, "minutes")
          .format("hh:mm A"),
        $gte: appointmentInfo.time,
      },
    });
    if (existingAppointment) {
      if (assistant) {
        return "Appointment already exists for this time";
      } else {
        throw new Error("Appointment already exists for this time");
      }
    }
    await appointmentCollection.insertOne(appointmentInfo);
    const reminderEmailsCollection = db.collection("reminder_emails");
    await reminderEmailsCollection.insertOne({
      date: appointmentInfo.date,
      time: appointmentInfo.time,
      to: appointmentInfo.email,
    });

    await sendEmail("template_asoqqkh", appointmentInfo.email, {
      fullname: appointmentInfo.fullname,
      date: appointmentInfo.date,
      time: appointmentInfo.time,
    });
    return appointmentInfo;
  } catch (error) {
    console.error(error);
    throw new Error("Error creating appointment: " + error.message);

    // res.status(500).send("Internal Server Error");
  }
};

// Update appointment
const updateAppointment = async (
  doctorId,
  appointmentInfo,
  assistant = false
) => {
  try {
    if (!appointmentInfo && !appointmentInfo._id) {
      throw new Error("Invalid appointment data");
    }
    appointmentInfo.date = moment(appointmentInfo.date).format("YYYY-MM-DD");
    const appointmentId = appointmentInfo._id;
    delete appointmentInfo._id;

    const db = await getDB();
    const collection = db.collection("appointments");

    // check if appointment exists at the same time
    const existingAppointment = await collection.findOne({
      doctorId: doctorId,
      date: appointmentInfo.date,
      time: {
        $lte: moment(appointmentInfo.time)
          .add(appointmentInfo.duration, "minutes")
          .format("hh:mm A"),
        $gte: appointmentInfo.time,
      },
      _id: { $ne: new ObjectId(appointmentId) }, // exclude the current appointment
    });
    if (existingAppointment) {
      if (assistant) {
        return "Appointment already exists for this time";
      } else {
        throw new Error("Appointment already exists for this time");
      }
    }
    await collection.updateOne(
      { _id: new ObjectId(appointmentId), doctorId: doctorId },
      { $set: appointmentInfo }
    );

    return "OK";
  } catch (error) {
    console.error(error);
    throw new Error("Error updating appointment: " + error.message);
  }
};

// Delete appointment
const deleteAppointment = async (doctorId, appointmentId) => {
  try {
    if (!appointmentId) {
      throw new Error("Invalid appointment ID");
    }
    const db = await getDB();
    const collection = db.collection("appointments");
    await collection.deleteOne({
      _id: new ObjectId(appointmentId),
      doctorId: doctorId,
    });

    return "OK";
  } catch (error) {
    console.error(error);
    throw new Error("Error deleting appointment: " + error.message);
  }
};

// Get appointments
const getAppointments = async (doctorId: string, date?: string) => {
  try {
    const db = await getDB();
    const collection = db.collection("appointments");
    const searchQuery: any = { doctorId: doctorId };
    if (date) searchQuery.date = date;

    const appointments = await collection.find(searchQuery).toArray();
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

// Route handlers
router.post("/create", async (req: Request, res: Response) => {
  try {
    const doctorId = req.user.id;
    const appointmentInfo = req.body.appointmentInfo;
    const appointment = await createAppointment(doctorId, appointmentInfo);
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.patch("/update", async (req: Request, res: Response) => {
  try {
    const doctorId = req.user.id;
    const appointmentInfo = req.body.appointmentInfo;
    const result = await updateAppointment(doctorId, appointmentInfo);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send(error?.message || "Internal Server Error");
  }
});

router.delete("/delete/:appointmentId", async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.appointmentId;
    const doctorId = req.user.id;
    const result = await deleteAppointment(doctorId, appointmentId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/", async (req: Request, res: Response) => {
  try {
    const doctorId = req.user.id;
    const appointments = await getAppointments(doctorId);
    appointments.forEach((appointment) => {
      // check if appointment date is before today
      if (
        moment(appointment.date).isBefore(moment(), "day") &&
        appointment.status !== "completed"
      ) {
        appointment.status = "past";
      }
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Export all functions and the router
export {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointments,
  router as default,
};
