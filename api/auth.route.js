// api/auth.route.js
import express from "express";
import AuthController from "./auth.controller.js";

const router = express.Router();

router.post("/login", AuthController.apiLogin);
router.post("/register", AuthController.apiRegister);
router.get("/verify/:token", AuthController.apiVerify);

// Temporary test endpoint for email debugging
router.get("/test-email", AuthController.apiTestEmail); // Use the new controller method

export default router;