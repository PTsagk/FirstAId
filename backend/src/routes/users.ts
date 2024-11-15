import Express from "express";
import { connectDB, closeDB } from "../connect";
const router = Express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("users");
    const result = await collection.find({}).toArray();
    await closeDB();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/register", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("users");
    const result = await collection.insertOne(req.body);
    await closeDB();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/login", async (req, res) => {
  try {
    const db = await connectDB();
    const collection = db.collection("users");
    const result = await collection.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    await closeDB();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
