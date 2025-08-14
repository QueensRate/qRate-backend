import express from "express" // importing express to use routing features
import ProfessorReviewsCtrl from "./professor-reviews.controller.js" // importing the professor reviews controller
import { authMiddleware } from "../middleware/auth.js"; // New import for authentication and verification
import { authWithProfanityFilter } from "../middleware/auth.js"; // New import for authentication and verification

// Creating a new router instance specific to professor reviews
const router = express.Router()

/*
GET /api/v1/professors/search/DrSmith
Returns all reviews for a specific professor.
This assumes the professor's name is passed as a route parameter.
*/
router.route("/search").get(ProfessorReviewsCtrl.apiSearchByName);

/*
POST /api/v1/professors/new
Allows users to submit a new professor review via JSON in the request body
*/
router.route("/new").post(authWithProfanityFilter, ProfessorReviewsCtrl.apiPostReview); // Added authMiddleware

/*
GET /api/v1/professors/abc123 -> gets one review by ID
PUT /api/v1/professors/abc123 -> updates that review
DELETE /api/v1/professors/abc123 -> deletes that review
*/
router.route("/:id")
  .get(ProfessorReviewsCtrl.apiGetReview)
  .put(authWithProfanityFilter, ProfessorReviewsCtrl.apiUpdateReview) // Added authMiddleware
  .delete(authMiddleware, ProfessorReviewsCtrl.apiDeleteReview); // Added authMiddleware

// exporting the router so it can be used in the main server file
export default router
