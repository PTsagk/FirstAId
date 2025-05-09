// create appointment
import { Request, Response, Router } from "express";
import { connectDB, closeDB } from "../connect";
import { sendEmail } from "../utils/email";
import moment from "moment";
import { ObjectId } from "mongodb";
const router = Router();

router.post("/create", async (req: Request, res: Response) => {
  try {
    const appointmentInfo = req.body.appointmentInfo;
    if (!appointmentInfo) {
      return res.status(400).send("Invalid appointment data");
    }
    appointmentInfo.doctorId = req.user.id;
    appointmentInfo.date = moment(appointmentInfo.date).format("YYYY-MM-DD");
    const db = await connectDB();
    const appointmentCollection = db.collection("appointments");
    await appointmentCollection.insertOne(appointmentInfo);
    const scheduledCollection = db.collection("scheduledEmails");
    await scheduledCollection.insertOne({
      date: appointmentInfo.date,
      time: appointmentInfo.time,
      to: appointmentInfo.email,
    });
    await closeDB();
    await sendEmail("template_asoqqkh", appointmentInfo.email, {
      fullname: appointmentInfo.fullname,
      date: appointmentInfo.date,
      time: appointmentInfo.time,
    });
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/update", async (req: Request, res: Response) => {
  try {
    const appointmentInfo = req.body.appointmentInfo;
    const appointmentId = appointmentInfo._id;
    if (!appointmentInfo || !appointmentId) {
      return res.status(400).send("Invalid appointment data");
    }
    appointmentInfo.date = moment(appointmentInfo.date).format("YYYY-MM-DD");
    delete appointmentInfo._id;

    const db = await connectDB();
    const collection = db.collection("appointments");
    await collection.updateOne(
      { _id: new ObjectId(appointmentId.toString()), doctorId: req.user.id },
      { $set: appointmentInfo }
    );
    await closeDB();
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/delete/:appointmentId", async (req: Request, res: Response) => {
  try {
    const appointmentId = req.params.appointmentId;
    if (!appointmentId) {
      return res.status(400).send("Invalid appointment data");
    }
    const db = await connectDB();
    const collection = db.collection("appointments");
    await collection.deleteOne({
      _id: new ObjectId(appointmentId),
      doctorId: req.user.id,
    });
    await closeDB();
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/", async (req: Request, res: Response) => {
  try {
    const db = await connectDB();
    const collection = db.collection("appointments");
    const appointments = await collection
      .find({ doctorId: req.user.id })
      .toArray();
    await closeDB();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
