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
    // const gptResponse = await runCompletion(
    //   `The doctor wants to generate an email message for the patient about a completed appointment with the following reason:
    //     ${question}.

    //     Instead of generating one full message, create a list of **separate sections** (e.g., greeting, appointment summary, helpful info, follow-up instructions, closing) that the doctor can choose from and combine.

    //     For each section, generate **multiple alternative options** so the doctor has choices.

    //     In the helpful info section, give advices based on the provided context.

    //     Format:
    //     - Separate different sections with <separator>
    //     - Within each section, separate multiple options with <option>
    //     - Do not include any title on context about what each section is

    //     Example format:
    //     Greeting line 1
    //     <option>
    //     Greeting line 2
    //     <separator>
    //     Appointment summary 1
    //     <option>
    //     Appointment summary 2
    //     <separator>
    //     Helpful info 1
    //     <option>
    //     Helpful info 2
    //     <separator>
    //     Closing line 1
    //     <option>
    //     Closing line 2
    //     <separator>

    //     Use the following context to make the sections relevant and supportive:
    //     Doctor notes: ${appointmentInfo.doctorNotes}
    //     Patient notes: ${appointmentInfo.description}.

    //     Doctor info: ${JSON.stringify(doctorInfo)}
    //     Patient info: ${JSON.stringify(patientInfo)}
    // `
    // );
    // const gptResponse = await runCompletion(
    //   `The doctor wants advice for the patient about a completed appointment.
    //     The doctor question is ${question}.

    //   Provide as list of usefull tips, advices, recommendations and pharmaceutical prescriptions
    //   Format:
    //     - Separate different sections with <separator>
    //     - Do not include any title, context, numbers or bullet points about what each section is

    //     Use the following context to make the sections relevant and supportive:
    //     Doctor notes: ${appointmentInfo.doctorNotes}
    //     Patient notes: ${appointmentInfo.description}.

    //     Doctor info: ${JSON.stringify(doctorInfo)}
    //     Patient info: ${JSON.stringify(patientInfo)}
    // `
    // );
    const gptResponse = await runCompletion(`
      You are a clinical decision-support assistant. 
      Based on the doctor’s notes, patient history, and the reason for today’s appointment, 
      summarize the key clinical issues and suggest possible classes of medications or treatment options that a licensed physician might consider. 
      Provide a prescription and exact dosage if asked or advices/recommendations. 
       Include any important safety considerations (e.g., allergies, contraindications, drug interactions, age-related risks). 
       The output should never include a warning regarding that you can't provide valid prescriptions (I will inform the users about that)
       The doctor's question is: ${question}
       Format:
        - Separate different prescriptions with <separator>
        - Do not include any title, context, numbers or bullet points about what each section is
        - Provide 3 or more alternative prescriptions/recommendations
       Use the following context to make the sections relevant and supportive:
        Doctor notes: ${appointmentInfo.doctorNotes}
        Patient notes: ${appointmentInfo.description}.
        Doctor info: ${JSON.stringify(doctorInfo)}
        Patient info: ${JSON.stringify(patientInfo)}
       `);
    const templates =
      gptResponse.choices[0].message.content.split("<separator>");

    res.json(templates);
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
    const info = {
      doctorNotes: appointmentInfo.doctorNotes,
      patientNotes: appointmentInfo.description,
      doctorInfo: JSON.stringify(doctorInfo),
      patientInfo: JSON.stringify(patientInfo),
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
