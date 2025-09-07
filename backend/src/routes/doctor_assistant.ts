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
       The responses should be based on the FHIR (Fast Healthcare Interoperability Resources) standards and guidelines while using the ICD-10 coding.
       Each prescription/recommendation is separate from each other (don't use words like alternative, another etc)
       Do not include any title, context, numbers or bullet points about what each section is
        Format the output as a JSON array of objects, where each object contains the following fields (create at least 3 elements/alternatives):
        {
          {
            "humanText": "A detailed human-readable text of the prescription or advice. The format should be from doctor's perspective",
            "resourceType": "The type of the care plan, e.g., CarePlan",
            "id": "A unique identifier for the care plan (generate a random uuid)",
            "intent": "plan",
            "subject": { "reference": "The name of the patient" },
            "title": "The title of the care plan",
            "description": "A brief description of the care plan",
            "created": "The date the care plan was created",
            "author": { "reference": "The name of the doctor" },
            "addresses": [
              {
                "coding": [
                  {
                    "system": "http://hl7.org/fhir/sid/icd-10",
                    "code": "The ICD-10 code of the condition",
                    "display": "The description of the ICD-10 code"
                  }
                ]
              }
            ],
            "activity": [
              {
                "detail": {
                  "kind": "ServiceRequest",
                  "code": {
                    "coding": [
                      {
                        "system": "http://hl7.org/fhir/sid/icd-10",
                        "code": "Z13.220",
                        "display": "Encounter for screening for lipoid disorders"
                      }
                    ]
                  },
                  "description": "Order fasting lipid panel"
                }
              },
            ]
          }
        }
       The doctor's question is: ${question}
       
       Use the following context to make the sections relevant and supportive:
       Today's date is ${new Date().toISOString().split("T")[0]}.
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
