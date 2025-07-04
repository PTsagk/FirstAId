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
    // get doctor info
    const doctorCollection = db.collection("doctors");
    const doctor = await doctorCollection.findOne({
      _id: new ObjectId(doctorId),
    });
    const workingStart = moment(doctor.workingStartTime, "hh:mm A");
    const workingEnd = moment(doctor.workingEndTime, "hh:mm A");
    const appointmentTime = moment(appointmentInfo.time, "hh:mm A");
    if (
     ( appointmentTime.isBefore(workingStart) ||
      appointmentTime.isAfter(workingEnd) && appointmentInfo.severity == 'appointment')
    ) {
      if (assistant) {
        return "Appointment time is outside of doctor's working hours";
      } else {
        throw new Error(
          "Appointment time is outside of doctor's working hours"
        );
      }
    }
    const appointmentCollection = db.collection("appointments");
    const existingAppointment = await appointmentCollection.findOne({
      doctorId: appointmentInfo.doctorId,
      date: appointmentInfo.date,
      time: {
        $lt: moment(appointmentInfo.time)
          .add(appointmentInfo.duration, "minutes")
          .format("HH:mm"),
        $gt: moment(appointmentInfo.time).format("HH:mm"),
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

    const doctorCollection = db.collection("doctors");
    const doctor = await doctorCollection.findOne({
      _id: new ObjectId(doctorId),
    });
    const workingStart = moment(doctor.workingStartTime, "hh:mm A");
    const workingEnd = moment(doctor.workingEndTime, "hh:mm A");
    const appointmentTime = moment(appointmentInfo.time, "hh:mm A");
    if (
      (appointmentTime.isBefore(workingStart) ||
      appointmentTime.isAfter(workingEnd)) && appointmentInfo.severity == 'appointment'
    ) {
      if (assistant) {
        return "Appointment time is outside of doctor's working hours";
      } else {
        throw new Error(
          "Appointment time is outside of doctor's working hours"
        );
      }
    }
    const collection = db.collection("appointments");

    const startTime = moment(appointmentInfo.time, "hh:mm A")
      .subtract(50, "minutes")
      .format("HH:mm");
    const endTime = moment(appointmentInfo.time, "hh:mm A")
      .add(50, "minutes")
      .format("HH:mm");

    const existingAppointment = await collection.findOne({
      doctorId: doctorId,
      date: appointmentInfo.date,
      time: { $gt: startTime, $lt: endTime },
      _id: { $ne: new ObjectId(appointmentId) },
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
const getAppointments = async (
  doctorId: string,
  date?: string,
  assistant: boolean = false
) => {
  try {
    const db = await getDB();
    const collection = db.collection("appointments");
    const searchQuery: any = { doctorId: doctorId };
    if (date && !assistant) searchQuery.date = date;

    const appointments = await collection.find(searchQuery).toArray();
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

const getAvailableHours = async (doctorId: string, date: string, severity: string = 'appointment') => {
  try {
    const db = await getDB();
    const doctorCollection = db.collection("doctors");
    const doctor = await doctorCollection.findOne({
      _id: new ObjectId(doctorId),
    });
    if (!doctor) {
      return "Doctor not found";
    }
    // check if day is in working days
    const appointmentDate = moment(date);
    const appointmentDay = appointmentDate.format("dddd"); // e.g. "Monday"
    if (!doctor.workingDays.includes(appointmentDay)) {
      return "Doctor is not working on this day";
    }

    // check working hours
    const workingStart = moment(doctor.workingStartTime, "hh:mm A");
    let workingEnd = moment(doctor.workingEndTime, "hh:mm A");
    if(severity === 'emergency' || severity === 'critical') {
      workingEnd = moment(workingEnd).add(2, "hours");
    }
    const appointmentCollection = db.collection("appointments");
    const appointments = await appointmentCollection
      .find({
        doctorId: doctorId,
        date: moment(date).format("YYYY-MM-DD"),
      })
      .toArray();
    const availableHours = [];
    let currentTime = workingStart.clone();
    while (currentTime.isBefore(workingEnd)) {
      const timeString = currentTime.format("hh:mm A");
      const isBooked = appointments.some((appointment) => {
        const appointmentTime = moment(appointment.time, "hh:mm A");
        return appointmentTime.isSame(currentTime, "minute");
      });
      if (!isBooked) {
        availableHours.push(timeString);
      }
      currentTime.add(doctor.appointmentDuration, "minutes");
    }
    return availableHours;
  } catch (error) {
    console.error("Error fetching available hours:", error);
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

router.get("/available-hours", async (req: Request, res: Response) => {
  try {
    const doctorId = req.user.id;
    const date = req.query.date as string;
    if (!date) {
      return res.status(400).send("Date is required");
    }
    const availableHours = await getAvailableHours(doctorId, date);
    res.json(availableHours);
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
  getAvailableHours,
  router as default,
};
