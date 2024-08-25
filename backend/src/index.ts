// src/index.ts
import express from "express";
import dotenv from "dotenv";
import mongoose, { mongo } from "mongoose";

const app = express();
dotenv.config();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

app.get("/get/users", async (req, res) => {
  try {
    const userSchema = new mongoose.Schema({
      name: String,
      age: Number,
    });
    const userModel = mongoose.model("users", userSchema);
    const users = await userModel.find({
      name: "admin",
    });
    res.json(users);
  } catch (error) {
    console.log(error);
    res.send("Something went wrong").status(500);
  }
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
