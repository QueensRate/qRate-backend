import express from "express" //importing the express library in order to use Express features like routing and middleware
import ReviewsCtrl from "./reviews.controller.js" //importing all the functions like apiGetReviews from the controller file
import { authMiddleware } from "../middleware/auth.js"; // New import for authentication and verification
import { authWithProfanityFilter } from "../middleware/auth.js";
/* 
Creating a router instance, which is basically an Express mini app that only handles routes. I can 
attach HTTP methods handlers like .get(), .post(), .delete(), etc to this router. This is used for modular
routing, so instead of putting all my routes in server.js, I'm going to break them into files like reviews.route.js
*/
const router = express.Router() 


/* Sets up a GET route for URLs like /api/v1/reviews/movie/Cars2. id is a route paramter, 
it can match any course ID. This will return all the reviews for a specific movie */
router.route("/course/:id").get(ReviewsCtrl.apiGetReviews)

/* Sets up a POST route for /api/v1/reviews/new. This is where the frontend can submit a new
review by sending a JSON body (eg. name, review, movieId). */
router.route("/new").post(authWithProfanityFilter, ReviewsCtrl.apiPostReview); // Added authMiddleware

/* 
Handles GET, PUT, DELETE requests for a specific review ID, which is different from course id. 
You'll be able to:

GET /api/v1/reviews/abc123 -> retrieves a single review
PUT /api/v1/reviews/abc123 -> updates that review
DELETE /api/v1/reviews/abc123 -> delete that specific review

*/
router.route("/:id")
    .get(ReviewsCtrl.apiGetReview)
   .put(authWithProfanityFilter, ReviewsCtrl.apiUpdateReview) // Added authMiddleware
  .delete(authMiddleware, ReviewsCtrl.apiDeleteReview); // Added authMiddleware

//exports this app so it can be imported in other js files and connected in my main app
export default router