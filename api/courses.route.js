import express from "express";
import CoursesCtrl from "./courses.controller.js"; 

const router = express.Router();

// Route to get all courses (matches /api/v1/courses)
router.route("/").get(CoursesCtrl.apiGetCourses);

export default router;