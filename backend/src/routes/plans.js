import express from "express";
import {
  createPlan,
  deletePlan,
  editplan,
  getAllPlans,
  getPlan,
} from "../controllers/planController.js";

const router = express.Router();

router.get("/", getAllPlans);
router.post("/", createPlan);
router.get("/:id", getPlan);
router.patch("/:id", editplan);
router.delete("/:id", deletePlan);

export default router;
