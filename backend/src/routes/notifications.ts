import { Request, Response } from "express";
import Express from "express";
import { connectDB, closeDB } from "../connect";
const router = Express.Router();

router.post("/create", async (req, res) => {
  try {
    const notification = req.body;
    if (!notification) {
      return res.status(400).send("Invalid notification data");
    }
    const db = await connectDB();
    const collection = db.collection("scheduledEmails");
    await collection.insertOne({
      date: notification.date,
      time: notification.time,
      to: notification.to,
      doctorNotes: notification.doctorNotes,
    });
    await closeDB();
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
