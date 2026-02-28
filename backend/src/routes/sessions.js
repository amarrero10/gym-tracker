import express from "express";
import {
  addSet,
  createSession,
  editSet,
  finishSession,
  getInProgressSession,
} from "../controllers/sessionController.js";

const router = express.Router();

router.get("/in-progress", getInProgressSession);
router.post("/start", createSession);
router.post("/:sessionId/finish", finishSession);
router.post("/:sessionId/exercises/:sessionExerciseId/sets", addSet);
router.patch("/:sessionId/exercises/:sessionExerciseId/sets/:setId", editSet);

export default router;
