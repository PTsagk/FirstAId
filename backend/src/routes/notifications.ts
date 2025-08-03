import Express from "express";
import { getDB } from "../utils/connect";
const router = Express.Router();

router.post("/create", async (req, res) => {
  try {
    const notification = req.body;
    if (!notification) {
      return res.status(400).send("Invalid notification data");
    }
    if (
      !notification.date ||
      !notification.time ||
      !notification.to ||
      !notification.fullname
    ) {
      return res.status(400).send("Missing required fields");
    }
    await createNotification(notification);
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const createNotification = async (notification) => {
  try {
    const db = await getDB();
    const collection = db.collection("notification_emails");
    await collection.insertOne({
      date: notification.date,
      time: notification.time,
      to: notification.to,
      doctorNotes: notification.doctorNotes,
      patientNotes: notification.patientNotes,
      fullname: notification.fullname,
      messageReason: notification.messageReason,
    });
    return "Notification created successfully";
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};

export { createNotification, router as default };
