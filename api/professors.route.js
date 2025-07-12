import express from "express";
import ProfessorsCtrl from "./professors.controller.js"; 

const router = express.Router();

// Route to get all professors (matches /api/v1/professors)
router.route("/").get(ProfessorsCtrl.apiGetProfessors);

export default router;