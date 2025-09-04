import Express from "express";
import { getDB } from "../utils/connect";
const router = Express.Router();
import { ObjectId } from "mongodb";
import {
  runDoctorAssistant,
  getAssistantMessages,
  createThreadId,
  deleteThread,
  runCompletion,
  createConversation,
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
      threadId = await createThreadId();
      await doctors.updateOne(
        { _id: new ObjectId(req.user.id) },
        { $set: { assistantThread: threadId } }
      );
    }
    const messages = await runDoctorAssistant(threadId, question, req.user.id);
    let message = messages.length > 0 ? messages.shift() : null;
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/message/generate", async (req, res) => {
  try {
    const question = req.body.question;
    const appointmentId = req.body.appointmentId;
    const patientId = req.body.patientId;
    const doctorId = req.user.id;
    const db = await getDB();
    const appointmentInfo = await db
      .collection("appointments")
      .findOne({ _id: new ObjectId(appointmentId) });
    const patientInfo = await db
      .collection("patients")
      .findOne({ _id: new ObjectId(patientId) });
    const doctorInfo = await db
      .collection("doctors")
      .findOne({ _id: new ObjectId(doctorId) });
    const generalPatientNotes = await db.collection("notes").findOne({
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
    });

    const gptResponse = await runCompletion(`
      You are a clinical decision-support assistant. 
      Based on the doctor's notes, patient history, and the reason for today’s appointment, 
      summarize the key clinical issues and suggest possible classes of medications or treatment options that a licensed physician might consider. 
      Provide a prescription and exact dosage if asked or advices/recommendations. 
       Include any important safety considerations (e.g., allergies, contraindications, drug interactions, age-related risks). 
       The output should never include a warning regarding that you can't provide valid prescriptions (I will inform the users about that)
       The doctor's question is: ${question}
       Format:
        - Each prescription/recommendation is separate from each other (don't use words like alternative, another etc)
        - Do not include any title, context, numbers or bullet points about what each section is
        - Provide at least 3 alternative prescriptions/recommendations
        - The response format should be from doctor's perspective
        - Return an array with the prescriptions where each element will be an object {text: "Prescription text", prescription: "The name of the prescription that the doctor requested"}
       Use the following context to make the sections relevant and supportive:
        Doctor notes: ${appointmentInfo.doctorNotes}
        Patient notes: ${appointmentInfo.description}.
        Doctor info: ${JSON.stringify(doctorInfo)}
        Patient info: ${JSON.stringify(patientInfo)}
        Doctor notes about the patient in general: ${JSON.stringify(
          generalPatientNotes?.notes || ""
        )}
       `);
    const options = JSON.parse(gptResponse.choices[0].message.content);

    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/advisor", async (req, res) => {
  try {
    const { messages, appointmentInfo, question } = req.body;
    const db = await getDB();
    const doctorInfo = await db
      .collection("doctors")
      .findOne({ _id: new ObjectId(appointmentInfo.doctorId) });
    const patientInfo = await db
      .collection("patients")
      .findOne({ _id: new ObjectId(appointmentInfo.patientId) });
    const generalPatientNotes = await db.collection("notes").findOne({
      patientId: new ObjectId(appointmentInfo.patientId),
      doctorId: new ObjectId(appointmentInfo.doctorId),
    });
    const info = {
      doctorNotes: appointmentInfo.doctorNotes,
      patientNotes: appointmentInfo.description,
      doctorInfo: JSON.stringify(doctorInfo),
      patientInfo: JSON.stringify(patientInfo),
      generalPatientNotes: JSON.stringify(generalPatientNotes?.notes || ""),
    };
    const response = await createConversation(messages, info, question);
    res.json(response);
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
      return res.json([]);
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
    await doctors.updateOne(
      { assistantThread: threadId },
      { $unset: { assistantThread: "" } }
    );
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
