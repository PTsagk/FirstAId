import { Request, Response } from "express";
import Express from "express";
import { getDB } from "../utils/connect";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Express.Router();
import { ObjectId } from "mongodb";
import { authenticateToken } from "./auth";
import { createThreadId, getAssistantMessages } from "../utils/openai";
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

router.post(
  "/notes",
  authenticateToken,
  async (req: Request, res: Response) => {
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

export default router;
