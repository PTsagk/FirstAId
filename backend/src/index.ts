import express from "express";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routes/users";
import appointmentRouter from "./routes/appointments";
import cors from "cors";
import { authenticateToken } from "./routes/auth";
const app = express();
dotenv.config({ path: "../.env", override: true });
const port = process.env.PORT || 3000;
app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:4200", "https://first-ai-d.netlify.app"],
  optionsSuccessStatus: 200,
  credentials: true,
};

// Define cookie options with SameSite attribute
const cookieOptions = {
  sameSite: "lax", // or 'none' if you are using https
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
};

app.use(express.urlencoded({ extended: true, limit: 4000000 }));
app.use(express.json({ limit: 4000000 }));
app.use(cookieParser(process.env.COOKIE_SECRET, cookieOptions));
app.use(cors(corsOptions));
app.use("/users", userRouter);
app.use("/appointments", authenticateToken, appointmentRouter);
app.get("/", (req, res) => {
  res.send("Hello, TypeScript with Express!");
});

app.listen(port, async () => {
  // await connectDatabase();
  console.log(`Server is running on http://localhost:${port}`);
});
