import express from "express";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import usersRouter from "./routes/users";
import appointmentRouter from "./routes/appointments";
import doctorAssistantRouter from "./routes/doctor_assistant";
import patientAssistantRouter from "./routes/patient_assistant";
import notesRouter from "./routes/notes";
import cors from "cors";
import { authenticateToken } from "./routes/auth";
import cron from "node-cron";
import {
  sendReminderEmail,
  sendNotificationEmail,
  sendFollowUpEmail,
} from "./utils/email";
import notificationsRouter from "./routes/notifications";
import { getDB } from "./utils/connect";
import { ObjectId } from "mongodb";
const moment = require("moment");

const app = express();
dotenv.config({ path: "../.env", override: true });
const port = process.env.PORT || 3000;
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:4200", "https://first-ai-d.netlify.app"],
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(express.urlencoded({ extended: true, limit: 4000000 }));
app.use(express.json({ limit: 4000000 }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/users", usersRouter);
app.use("/appointments", authenticateToken, appointmentRouter);
app.use("/notes", authenticateToken, notesRouter);
app.use("/notifications", authenticateToken, notificationsRouter);
app.use("/doctor-assistant", authenticateToken, doctorAssistantRouter);
app.use("/patient-assistant", authenticateToken, patientAssistantRouter);
app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

cron.schedule("* * * * *", async () => {
  console.log("Checking for scheduled emails...");
  const db = await getDB();

  const collection = db.collection("emails-queue");
  const emailsToSend = await collection
    .find({
      date: moment().format("YYYY-MM-DD"),
    })
    .toArray();

  for (const emailData of emailsToSend) {
    if (emailData.type === "reminder") {
      emailData.sent = await sendReminderEmail(emailData);
    } else if (emailData.type === "notification") {
      emailData.sent = await sendNotificationEmail(emailData);
    } else if (emailData.type === "message") {
      emailData.sent = await sendFollowUpEmail(emailData);
    } else {
      emailData.sent = false;
    }
  }

  await collection.deleteMany({
    _id: {
      $in: emailsToSend
        .filter((emailData) => emailData.sent)
        .map((emailData) => new ObjectId(emailData._id)),
    },
  });

  // Check for new notifications and send to clients
  const notificationsCollection = db.collection("notifications");
  const newNotifications = await notificationsCollection
    .find({ sent: false })
    .toArray();

  for (const notification of newNotifications) {
    const patientId = notification.patientId;

    if (patientId && sseConnections.has(patientId)) {
      const res = sseConnections.get(patientId);
      try {
        res?.write(
          `data: ${JSON.stringify({
            type: "notification",
            data: notification,
          })}\n\n`
        );

        // Mark as sent
        await notificationsCollection.updateOne(
          { _id: notification._id },
          { $set: { sent: true, sentAt: new Date() } }
        );

        console.log(`Notification sent to patient: ${patientId}`);
      } catch (error) {
        console.error(
          `Failed to send notification to patient ${patientId}:`,
          error
        );
        sseConnections.delete(patientId);
      }
    }
  }
});
const sseConnections = new Map<string, express.Response>();

// SSE endpoint for notifications
app.get("/notifications/stream", authenticateToken, (req: any, res) => {
  const patientId = req.patient.id;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Credentials": "true",
  });

  // Store connection
  sseConnections.set(patientId, res);

  // Send initial connection confirmation
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: "Connected to notifications",
    })}\n\n`
  );

  // Handle client disconnect
  req.on("close", () => {
    sseConnections.delete(patientId);
    console.log(`SSE connection closed for patient: ${patientId}`);
  });
});

app.listen(port, async () => {
  // await connectDatabase();
  console.log(`Server is running on http://localhost:${port}`);
});
