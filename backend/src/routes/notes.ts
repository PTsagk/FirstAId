import { Request, Response } from "express";
import Express from "express";
import { getDB } from "../utils/connect";
import { ObjectId } from "mongodb";
const router = Express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const notes = req.body.notes;
    const userEmail = req.body.email;
    const userId = req.body.userId;
    const doctorId = req.user.id;
    if (!doctorId || !notes)
      return res.status(400).send("Missing doctorId or notes");
    const db = await getDB();
    const collection = db.collection("notes");
    const existingNote = await collection.findOne({
      doctorId: new ObjectId(doctorId),
      userId: new ObjectId(userId),
    });
    if (existingNote) {
      await collection.updateOne(
        { doctorId: new ObjectId(doctorId), userId: new ObjectId(userId) },
        { $set: { notes } }
      );
      res.json("Note updated successfully");
    } else {
      await collection.insertOne({
        doctorId: new ObjectId(doctorId),
        email: userEmail,
        notes,
        userId: new ObjectId(userId),
      });
      res.json("Note created successfully");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
