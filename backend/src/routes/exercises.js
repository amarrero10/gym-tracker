import express from "express";
import {
  getAllExercises,
  createExercise,
} from "../controllers/exerciseController.js";

const router = express.Router();

router.get("/", getAllExercises);
router.post("/", createExercise);

export default router;
