// create appointment
import { Request, Response, Router } from "express";
import { connectDB, closeDB } from "../connect";
import { sendEmail } from "../utils/email";
import moment from "moment";
const router = Router();

router.post("/create", async (req: Request, res: Response) => {
  try {
    const appointmentInfo = req.body.appointmentInfo;
    if (!appointmentInfo) {
      return res.status(400).send("Invalid appointment data");
    }
    appointmentInfo.doctorId = req.user.id;
    appointmentInfo.appointmentDate = moment(
      appointmentInfo.appointmentDate
    ).format("YYYY-MM-DD");
    const db = await connectDB();
    const collection = db.collection("appointments");
    await collection.insertOne(appointmentInfo);
    await closeDB();
    await sendEmail(
      appointmentInfo.email,
      appointmentInfo.fullname,
      appointmentInfo.appointmentDate,
      appointmentInfo.appointmentTime
    );
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
