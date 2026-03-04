import express from "express";
import { getMe, login, registerUser } from "../controllers/authController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/me", requireAuth, getMe);

export default router;
