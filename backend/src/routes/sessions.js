import express from "express";
import {
  addSet,
  createSession,
  editSet,
  finishSession,
  getAllSessions,
  getCompletedSessions,
  getInProgressSession,
  getSession,
  skipExercise,
  substituteExercise,
  removeSet,
} from "../controllers/sessionController.js";

const router = express.Router();

router.get("/", getAllSessions);
router.get("/in-progress", getInProgressSession);
router.get("/completed-sessions", getCompletedSessions);
router.get("/:id", getSession);
router.post("/start", createSession);
router.post("/:sessionId/finish", finishSession);
router.post("/:sessionId/exercises/:sessionExerciseId/sets", addSet);
router.patch("/:sessionId/exercises/:sessionExerciseId/sets/:setId", editSet);
router.patch("/:sessionId/exercises/:sessionExerciseId/skip", skipExercise);
router.patch("/:sessionId/exercises/:sessionExerciseId/substitute", substituteExercise);
router.delete("/:sessionId/exercises/:sessionExerciseId/sets/:setId", removeSet);

export default router;
