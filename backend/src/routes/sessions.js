import express from "express";
import { addSet, createSession } from "../controllers/sessionController.js";

const router = express.Router();

router.post("/start", createSession);
router.post("/:sessionId/exercises/:sessionExerciseId/sets", addSet);

export default router;
