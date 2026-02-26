import express from "express";
import {
  createPlan,
  getAllPlans,
  getPlan,
} from "../controllers/planController.js";

const router = express.Router();

router.get("/", getAllPlans);
router.post("/", createPlan);
router.get("/:id", getPlan);

export default router;
