import Express from "express";
import { getDB } from "../utils/connect";
const router = Express.Router();
import { ObjectId } from "mongodb";
import {
  getAssistantMessages,
  createThreadId,
  runPatientAssistant,
  deleteThread,
} from "../utils/openai";
import { authenticateToken } from "./auth";

router.post("/chat/:doctorId", async (req, res) => {
  try {
    const patientId = req.user.id;
    const question = req.body.question;
    const doctorId = req.params.doctorId;
    if (!patientId || !doctorId || !question)
      return res
        .status(400)
        .send("User ID, Doctor ID and question are required");
    const db = await getDB();
    const collection = db.collection("conversations-threads");
    let threadInfo = await collection.findOne({
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
    });
    let threadId = threadInfo?.threadId;
    if (!threadId) {
      // create a new thread for the patient
      threadId = await createThreadId();
      await collection.insertOne({
        patientId: new ObjectId(patientId),
        doctorId: new ObjectId(doctorId),
        threadId,
      });
    }
    const messages = await runPatientAssistant(
      threadId,
      question,
      patientId,
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
    const patientId = req.user.id;
    const doctorId = req.params.doctorId;
    if (!patientId || !doctorId)
      return res.status(400).send("User ID and Doctor ID are required");
    const db = await getDB();
    const collection = db.collection("conversations-threads");
    let threadInfo = await collection.findOne({
      patientId: new ObjectId(patientId),
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

router.delete("/thread/:doctorId", async (req, res) => {
  try {
    const patientId = req.user.id;
    const doctorId = req.params.doctorId;
    if (!patientId || !doctorId)
      return res.status(400).send("User ID and Doctor ID are required");
    const db = await getDB();
    const threads = db.collection("conversations-threads");
    const threadsData = await threads.findOne({
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
    });
    if (!threadsData) {
      return res.status(404).send("Doctor not found");
    }
    const threadId = threadsData.threadId;
    if (!threadId) {
      return res.status(404).send("Assistant not found");
    }
    await deleteThread(threadId);
    await threads.deleteOne({
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
    });
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
