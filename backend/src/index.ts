// src/index.ts
import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/users";
const app = express();
dotenv.config();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use("/users", userRouter);
app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

app.listen(port, async () => {
  // await connectDatabase();
  console.log(`Server is running on http://localhost:${port}`);
});
