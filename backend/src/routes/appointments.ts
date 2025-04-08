// create appointment
import { Router } from "express";
import { connectDB, closeDB } from "../connect";
import { sendEmail } from "../utils/email";
import moment from "moment";
const router = Router();

router.post("/create", async (req, res) => {
  try {
    const appointmentInfo = req.body.appointmentInfo;
    if (!appointmentInfo) {
      return res.status(400).send("Invalid appointment data");
    }
    const db = await connectDB();
    const collection = db.collection("appointments");
    await collection.insertOne(appointmentInfo);
    await closeDB();
    await sendEmail(
      appointmentInfo.email,
      appointmentInfo.fullname,
      moment(appointmentInfo.appointmentDate).format("YYYY-MM-DD"),
      appointmentInfo.appointmentTime
    );
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
export default router;
