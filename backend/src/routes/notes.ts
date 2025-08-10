import { Request, Response } from "express";
import Express from "express";
import { getDB } from "../utils/connect";
import { ObjectId } from "mongodb";
const router = Express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const notes = req.body.notes;
    const patientEmail = req.body.email;
    const patientId = req.body.patientId;
    const doctorId = req.user.id;
    if (!doctorId || !notes)
      return res.status(400).send("Missing doctorId or notes");
    const db = await getDB();
    const collection = db.collection("notes");
    const existingNote = await collection.findOne({
      doctorId: new ObjectId(doctorId),
      patientId: new ObjectId(patientId),
    });
    if (existingNote) {
      await collection.updateOne(
        {
          doctorId: new ObjectId(doctorId),
          patientId: new ObjectId(patientId),
        },
        { $set: { notes } }
      );
      res.json("Note updated successfully");
    } else {
      await collection.insertOne({
        doctorId: new ObjectId(doctorId),
        email: patientEmail,
        notes,
        patientId: new ObjectId(patientId),
      });
      res.json("Note created successfully");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.patch("/update", async (req: Request, res: Response) => {
  const db = await getDB();
  const { appointmentId, notes } = req.body;
  if (!appointmentId || !notes) {
    return res.status(400).send("Missing appointmentId or notes");
  }
  const collection = db.collection("appointments");
  await collection.updateOne(
    { _id: new ObjectId(appointmentId) },
    { $set: { doctorNotes: notes } }
  );
  res.json("Note updated successfully");
});

export default router;
