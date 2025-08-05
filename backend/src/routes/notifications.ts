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
      !notification.fullname ||
      !notification.messageReason ||
      !notification.appointmentId
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

router.post("/send-follow-up", async (req, res) => {
  try {
    const notification = req.body;
    if (!notification) {
      return res.status(400).send("Invalid notification data");
    }
    if (
      !notification.to ||
      !notification.message ||
      !notification.appointmentId
    ) {
      return res.status(400).send("Missing required fields");
    }
    await createFollowUpNotification(notification);
    res.json("Follow-up notification created successfully");
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
      appointmentId: notification.appointmentId,
    });
    return "Notification created successfully";
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};

const createFollowUpNotification = async (notification) => {
  try {
    const db = await getDB();
    const collection = db.collection("follow_up_emails");
    await collection.insertOne({
      to: notification.to,
      message: notification.message,
      fullname: notification.fullname,
      date: notification.date,
      time: notification.time,
    });
    const appointmentMessagesCollection = db.collection("appointment-messages");
    await appointmentMessagesCollection.insertOne({
      date: notification.date,
      time: notification.time,
      to: notification.to,
      fullname: notification.fullname,
      message: notification.message,
      appointmentId: notification.appointmentId,
    });

    return "Follow-up notification created successfully";
  } catch (error) {
    console.error("Error creating follow-up notification:", error);
    throw new Error("Failed to create follow-up notification");
  }
};
export { createNotification, createFollowUpNotification, router as default };
