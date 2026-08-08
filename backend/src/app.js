import express from "express";
import cors from "cors";
import testRouter from "./routes/test.js";
import exerciseRouter from "./routes/exercises.js";
import planRouter from "./routes/plans.js";
import sessionRouter from "./routes/sessions.js";
import authRouter from "./routes/auth.js";
import weightRouter from "./routes/weight.js";
import requireAuth from "./middleware/requireAuth.js";
import { connectDB } from "./config/db.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Failed to connect to MongoDB: ", err.message);
    res.status(503).json({ error: "Database unavailable" });
  }
});
app.use("/api", testRouter);
app.use("/api/exercises", exerciseRouter);
app.use("/api/plans", requireAuth, planRouter);
app.use("/api/sessions", requireAuth, sessionRouter);
app.use("/api/weight", requireAuth, weightRouter);
app.use("/api/auth", authRouter);

export default app;
