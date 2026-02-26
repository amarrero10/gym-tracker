import express from "express";
import { testRoute } from "../controllers/testController.js";

const router = express.Router();

router.get("/health", testRoute);

export default router;
