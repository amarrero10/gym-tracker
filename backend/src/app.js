import express from "express";
import cors from "cors";
import testRouter from "./routes/test.js";
import exerciseRouter from "./routes/exercises.js";
import planRouter from "./routes/plans.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", testRouter);
app.use("/api/exercises", exerciseRouter);
app.use("/api/plans", planRouter);

export default app;
