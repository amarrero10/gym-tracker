import express from "express";
import {
  deleteWeightEntry,
  getWeightEntries,
  logWeight,
  updateWeightEntry,
} from "../controllers/weightController.js";

const router = express.Router();

router.get("/", getWeightEntries);
router.post("/", logWeight);
router.patch("/:id", updateWeightEntry);
router.delete("/:id", deleteWeightEntry);

export default router;
