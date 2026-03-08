import express from "express";
import {
  addSet,
  createSession,
  editSet,
  finishSession,
  getCompletedSessions,
  getInProgressSession,
  getSession,
} from "../controllers/sessionController.js";

const router = express.Router();

router.get("/in-progress", getInProgressSession);
router.get("/completed-sessions", getCompletedSessions);
router.get("/:id", getSession);
router.post("/start", createSession);
router.post("/:sessionId/finish", finishSession);
router.post("/:sessionId/exercises/:sessionExerciseId/sets", addSet);
router.patch("/:sessionId/exercises/:sessionExerciseId/sets/:setId", editSet);

export default router;
