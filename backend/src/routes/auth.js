import express from "express";
import { changePassword, getMe, login, registerUser, updateProfile } from "../controllers/authController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.get("/me", requireAuth, getMe);
router.patch("/me", requireAuth, updateProfile);
router.patch("/me/password", requireAuth, changePassword);

export default router;
