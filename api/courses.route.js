import express from "express";
import CoursesCtrl from "./courses.controller.js"; 

const router = express.Router();

// Route to get all courses (matches /api/v1/courses)
router.route("/").get(CoursesCtrl.apiGetCourses);

// Route for getting a single course information by ID
router.route("/:id").get(CoursesCtrl.apiGetCourseById);

export default router;