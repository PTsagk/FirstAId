// src/index.ts
// import express from "express";
// import dotenv from "dotenv";
// import userRouter from "./routes/users";
// import cors from "cors";
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/users");
const cors = require("cors");
const app = express();
dotenv.config();
const port = process.env.PORT || 3000;
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:4200", "https://first-ai-d.netlify.app"], // Add your allowed domains here
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(express.urlencoded({ extended: true, limit: 4000000 }));
app.use(express.json({ limit: 4000000 }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/users", userRouter);
app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

app.listen(port, async () => {
  // await connectDatabase();
  console.log(`Server is running on http://localhost:${port}`);
});
