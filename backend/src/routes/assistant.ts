import Express from "express";
import { getDB } from "../utils/connect";
const router = Express.Router();
import { ObjectId } from "mongodb";
import {
  runAssistant,
  getAssistantMessages,
  createThreadId,
  deleteThread,
} from "../utils/openai";
router.post("/chat", async (req, res) => {
  try {
    const question = req.body.question;

    // call openai assistant and get the answer
    const db = await getDB();
    const doctors = db.collection("doctors");
    const doctorData = await doctors.findOne({
      _id: new ObjectId(req.user.id),
    });
    if (!doctorData) {
      return res.status(404).send("Doctor not found");
    }
    let threadId = doctorData.assistantThread;
    if (!threadId) {
      // create a new thread for the doctor
      threadId = await createThreadId(req.user.id);
    }
    const messages = await runAssistant(threadId, question, req.user.id);
    const message = messages.length > 0 ? messages.shift() : null;
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/messages", async (req, res) => {
  try {
    const db = await getDB();
    const doctors = db.collection("doctors");
    const doctorData = await doctors.findOne({
      _id: new ObjectId(req.user.id),
    });
    if (!doctorData) {
      return res.status(404).send("Doctor not found");
    }
    const threadId = doctorData.assistantThread;
    if (!threadId) {
      return res.status(404).send("Assistant not found");
    }
    const messages = await getAssistantMessages(threadId);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/thread", async (req, res) => {
  try {
    const db = await getDB();
    const doctors = db.collection("doctors");
    const doctorData = await doctors.findOne({
      _id: new ObjectId(req.user.id),
    });
    if (!doctorData) {
      return res.status(404).send("Doctor not found");
    }
    const threadId = doctorData.assistantThread;
    if (!threadId) {
      return res.status(404).send("Assistant not found");
    }
    await deleteThread(threadId);
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
