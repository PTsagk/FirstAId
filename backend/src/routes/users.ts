import { Request, Response } from "express";
import Express from "express";
import { getDB } from "../utils/connect";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Express.Router();
import { ObjectId } from "mongodb";
import { authenticateToken } from "./auth";
import { runCompletion } from "../utils/openai";
router.post("/:user/register", async (req, res) => {
  try {
    const userType = req.params.user;
    if (userType !== "doctors" && userType !== "patients")
      return res.status(400).send("Invalid user type");
    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).send("Passwords do not match");
    const db = await getDB();
    const collection = db.collection(userType);
    const existingUser = await collection.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(400).send("This email is already in use");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = { ...req.body, password: hashedPassword, userType };
    delete user.confirmPassword;
    const medicalHistory = await handleUserMedicalHistory(user);
    user.medicalHistory = medicalHistory;
    await collection.insertOne(user);
    res.json("Account created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/:user/login", async (req: Request, res: Response) => {
  try {
    const userType = req.params.user;
    if (userType !== "doctors" && userType !== "patients")
      return res.status(400).send("Invalid user type");
    const db = await getDB();
    const collection = db.collection(userType);
    const user = await collection.findOne({ email: req.body.email });
    if (!user) return res.status(401).send("Invalid email or password");
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid)
      return res.status(401).send("Invalid email or password");

    const token = jwt.sign(
      { id: user._id, userType, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    console.log(process.env.NODE_ENV);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/prescriptions", authenticateToken, async (req, res) => {
  try {
    const { patientId, prescriptions } = req.body;
    const db = await getDB();
    const collection = db.collection("patients");
    const patientInfo = await collection.findOne({
      _id: new ObjectId(patientId),
    });
    await collection.updateOne(
      { _id: new ObjectId(patientId) },
      {
        $set: {
          prescriptions: patientInfo.prescriptions
            ? patientInfo.prescriptions + ", " + prescriptions.join(",")
            : prescriptions.join(","),
        },
      }
    );
    res.json("Prescriptions updated successfully");
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
});

router.get("/logout", (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get(
  "/doctors",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const db = await getDB();
      const collection = db.collection("doctors");
      const doctors = await collection.find({}).toArray();
      res.json(doctors);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userType = req.user.userType;
    if (userType !== "doctors" && userType !== "patients")
      return res.status(400).send("Invalid user type");
    const db = await getDB();
    const collection = db.collection(userType);
    const user = await collection.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

const handleUserMedicalHistory = async (user: any) => {
  try {
    const fhirFormatedHistory = await runCompletion(
      `You are given a list of medical history items of a patient. Convert each item into a FHIR format using the ICD-10 coding only. Return an array of Objects where each object is the FHIR formatted medical history. Here is an example of a prescription format:
   {
  "resourceType": "The type of the history item, e.g., AllergyIntolerance, Condition, MedicationStatement, etc.",
  "id": "A unique identifier for the history item",
  "medicationCodeableConcept": {
    "text": "The name of the medication (generate a random uuid)"
  },
  "subject": { "reference": "The name of the patient" },
  "authoredOn": "The date the prescription was made",
  "requester": { "reference": "Doctor's name" },
  "reasonCode": [
    {
      "coding": [
        {
          "system": "http://hl7.org/fhir/sid/icd-10",
          "code": "The ICD-10 code of the history item",
          "display": "The description of the ICD-10 code"
        }
      ]
    }
  ],
  "dosageInstruction": [
    {
      "text": "Dosage instructions in human-readable format",
      "timing": { "repeat": { "frequency": 1, "period": 1, "periodUnit": "d" } },
      "doseAndRate": [
        {
          "doseQuantity": { "value": 20, "unit": "mg" }
        }
      ]
    }
  ]
}
  The patient's medical history and information is: ${JSON.stringify(user)}
  Today's date is ${new Date().toISOString().split("T")[0]}.
  `
    );
    console.log(fhirFormatedHistory.choices[0].message.content);
    return JSON.parse(fhirFormatedHistory.choices[0].message.content);
  } catch (err) {
    console.log(err);
    return [];
  }
};

export default router;
