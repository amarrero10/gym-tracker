import express from "express";
import {
  getAllExercises,
  createExercise,
  getExercise,
  updateExercise,
  deleteExercise,
} from "../controllers/exerciseController.js";

const router = express.Router();

router.get("/", getAllExercises);

router.get("/:id", getExercise);
router.post("/", createExercise);
router.put("/:id", updateExercise);
router.delete("/:id", deleteExercise);

export default router;
