import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routes/users";
import cors from "cors";
const app = express();
dotenv.config();
const port = process.env.PORT || 3000;
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:4200", "https://first-ai-d.netlify.app"],
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
