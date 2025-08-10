import Express from "express";
import { getDB } from "../utils/connect";
const moment = require("moment");
const router = Express.Router();

router.post("/doctor-message", async (req, res) => {
  try {
    const notification = req.body;
    if (!notification) {
      return res.status(400).send("Invalid notification data");
    }
    if (
      !notification.date ||
      !notification.time ||
      !notification.to ||
      !notification.from ||
      !notification.fullname ||
      !notification.messageReason ||
      !notification.appointmentId
    ) {
      return res.status(400).send("Missing required fields");
    }
    await createEmailNotification(notification);
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
      !notification.from ||
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

router.get("/", async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection("notifications");
    const notifications = await collection
      .find({ patientId: req.user.id })
      .toArray();
    notifications.forEach((n) => (n.read = true));
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const createNotification = async (notification) => {
  try {
    const db = await getDB();
    const collection = db.collection("notifications");
    await collection.insertOne({
      message: notification.message,
      sent: false,
      patientId: notification.patientId,
      createdAt: notification.createdAt,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};

const createEmailNotification = async (notification) => {
  try {
    const db = await getDB();
    const collection = db.collection("emails-queue");
    await collection.insertOne({
      date: notification.date,
      time: notification.time,
      to: notification.to,
      from: notification.from,
      doctorNotes: notification.doctorNotes,
      patientNotes: notification.patientNotes,
      fullname: notification.fullname,
      messageReason: notification.messageReason,
      appointmentId: notification.appointmentId,
      type: "message",
      userType: "doctor",
    });

    createNotification({
      message: "You have a new message from  " + notification.fullname,
      sent: false,
      patientId: notification.patientId,
      createdAt: moment().format("YYYY-MM-DD HH:mm"),
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
    const collection = db.collection("emails-queue");
    await collection.insertOne({
      to: notification.to,
      from: notification.from,
      message: notification.message,
      fullname: notification.fullname,
      date: notification.date,
      time: notification.time,
      type: "message",
      userType: "patient",
    });
    const messagesCollection = db.collection("messages");
    await messagesCollection.insertOne({
      date: notification.date,
      time: notification.time,
      to: notification.to,
      fullname: notification.fullname,
      message: notification.message,
      appointmentId: notification.appointmentId,
      userType: "patient",
    });

    createNotification({
      message: "You have a new message from  " + notification.fullname,
      sent: false,
      patientId: notification.doctorId,
      createdAt: moment().format("YYYY-MM-DD HH:mm"),
    });

    return "Follow-up notification created successfully";
  } catch (error) {
    console.error("Error creating follow-up notification:", error);
    throw new Error("Failed to create follow-up notification");
  }
};

export {
  createEmailNotification,
  createFollowUpNotification,
  createNotification,
  router as default,
};
