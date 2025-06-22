import Express from "express";
import { getDB } from "../utils/connect";
const router = Express.Router();
import { ObjectId } from "mongodb";
import {
  getAssistantMessages,
  createThreadId,
  runPatientAssistant,
} from "../utils/openai";
import { authenticateToken } from "./auth";

router.post("/chat/:doctorId", async (req, res) => {
  try {
    const userId = req.user.id;
    const question = req.body.question;
    const doctorId = req.params.doctorId;
    if (!userId || !doctorId || !question)
      return res
        .status(400)
        .send("User ID, Doctor ID and question are required");
    const db = await getDB();
    const collection = db.collection("patients-threads");
    let threadInfo = await collection.findOne({
      userId: new ObjectId(userId),
      doctorId: new ObjectId(doctorId),
    });
    let threadId = threadInfo?.threadId;
    if (!threadId) {
      // create a new thread for the patient
      threadId = await createThreadId();
      await collection.insertOne({
        userId: new ObjectId(userId),
        doctorId: new ObjectId(doctorId),
        threadId,
      });
    }
    const messages = await runPatientAssistant(
      threadId,
      question,
      userId,
      doctorId
    );
    const message = messages.length > 0 ? messages.shift() : null;
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/messages/:doctorId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const doctorId = req.params.doctorId;
    if (!userId || !doctorId)
      return res.status(400).send("User ID and Doctor ID are required");
    const db = await getDB();
    const collection = db.collection("patients-threads");
    let threadInfo = await collection.findOne({
      userId: new ObjectId(userId),
      doctorId: new ObjectId(doctorId),
    });
    if (!threadInfo?.threadId) {
      return res.json([]);
    }
    const messages = await getAssistantMessages(threadInfo.threadId);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
