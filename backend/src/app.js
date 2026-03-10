import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import testRouter from "./routes/test.js";
import exerciseRouter from "./routes/exercises.js";
import planRouter from "./routes/plans.js";
import sessionRouter from "./routes/sessions.js";
import authRouter from "./routes/auth.js";
import weightRouter from "./routes/weight.js";
import requireAuth from "./middleware/requireAuth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", testRouter);
app.use("/api/exercises", exerciseRouter);
app.use("/api/plans", requireAuth, planRouter);
app.use("/api/sessions", requireAuth, sessionRouter);
app.use("/api/weight", requireAuth, weightRouter);
app.use("/api/auth", authRouter);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(frontendDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export default app;
