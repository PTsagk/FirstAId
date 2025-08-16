import Express from "express";
import { getDB } from "../utils/connect";
import { ObjectId } from "mongodb";
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
      !notification.appointmentId ||
      !notification.userId
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
      .find({ userId: req.user.id })
      .toArray();
    notifications.forEach((n) => (n.read = true));
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const db = await getDB();
    const collection = db.collection("notifications");
    await collection.deleteOne({
      _id: new ObjectId(req.params.id),
      userId: req.user.id,
    });
    res.sendStatus(204);
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
      userId: notification.userId,
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
      userId: notification.userId,
      type: "message",
      userType: "doctor",
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

    const existingMessageDoc = await messagesCollection.findOne({
      appointmentId: notification.appointmentId,
    });

    const newMessage = {
      date: notification.date,
      time: notification.time,
      to: notification.to,
      fullname: notification.fullname,
      message: notification.message,
      userType: "patient",
    };

    if (existingMessageDoc) {
      await messagesCollection.updateOne(
        { appointmentId: notification.appointmentId },
        { $push: { messages: newMessage } }
      );
    } else {
      await messagesCollection.insertOne({
        appointmentId: notification.appointmentId,
        messages: [newMessage],
      });
    }

    createNotification({
      message: "You have a new message from  " + notification.fullname,
      sent: false,
      userId: notification.userId,
      createdAt: moment().format("YYYY-MM-DD HH:mm"),
    });

    return "Follow-up notification created successfully";
  } catch (error) {
    console.error("Error creating follow-up notification:", error);
    throw new Error("Failed to create follow-up notification");
  }
};

const sendSEENotification = async (sseConnections) => {
  // Check for new notifications and send to clients
  const db = await getDB();
  const notificationsCollection = db.collection("notifications");
  const newNotifications = await notificationsCollection
    .find({ sent: false })
    .toArray();

  for (const notification of newNotifications) {
    const userId = notification.userId;

    if (userId && sseConnections.has(userId)) {
      const res = sseConnections.get(userId);
      try {
        res?.write(
          `data: ${JSON.stringify({
            type: "notification",
            data: notification,
          })}\n\n`
        );

        console.log(`Notification sent to user: ${userId}`);
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        sseConnections.delete(userId);
      }
    }
    // Mark as sent
    await notificationsCollection.updateOne(
      { _id: notification._id },
      { $set: { sent: true, sentAt: new Date() } }
    );
  }
};

export {
  createEmailNotification,
  createFollowUpNotification,
  createNotification,
  sendSEENotification,
  router as default,
};
