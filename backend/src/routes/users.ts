import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import Express from "express";
import { connectDB, closeDB } from "../connect";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = Express.Router();
import { ObjectId } from "mongodb";
import { authenticateToken } from "./auth";

router.post("/:user/register", async (req, res) => {
  try {
    const userType = req.params.user;
    if (userType !== "doctors" && userType !== "patients")
      return res.status(400).send("Invalid user type");
    if (req.body.password !== req.body.confirmPassword)
      return res.status(400).send("Passwords do not match");
    const db = await connectDB();
    const collection = db.collection(userType);
    const existingUser = await collection.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(400).send("This email is already in use");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const user = { ...req.body, password: hashedPassword, userType };
    await collection.insertOne(user);
    await closeDB();
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
    const db = await connectDB();
    const collection = db.collection(userType);
    const user = await collection.findOne({ email: req.body.email });
    await closeDB();
    if (!user) return res.status(401).send("Invalid email or password");
    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordValid)
      return res.status(401).send("Invalid email or password");

    const token = jwt.sign({ id: user._id, userType }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
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

router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userType = req.user.userType;
    if (userType !== "doctors" && userType !== "patients")
      return res.status(400).send("Invalid user type");
    const db = await connectDB();
    const collection = db.collection(userType);
    const user = await collection.findOne({ _id: new ObjectId(req.user.id) });
    await closeDB();
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
