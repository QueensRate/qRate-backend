import CourseReviewsDAO from "../dao/CourseReviewsDAO.js" //importing my DAO file so it's ready to use 

//This is a controller class, called ReviewsController. It is built specifically for handling course reviews. 
//defining the controller class and exporting it so we can import it in our route.js file
export default class ReviewsController {

    static async apiPostReview(req, res, next) {
        try {
          const {
            courseCode,
            courseName,
            instructor,
            term,
            overallRating,
            difficulty,
            usefulness,
            workload,
            teaching,
            comment,
            user, // e.g., user = { name: "John Doe", userId: "abc123" }
          } = req.body;
      
          // Validate required fields
          if (
            !courseCode || !instructor || !term || !comment || comment.trim().length < 50
          ) {
            return res.status(400).json({ error: "Missing or invalid required fields" });
          }
      
          const review = {
            courseCode,
            courseName,
            instructor,
            term,
            overallRating: overallRating?.[0] || 0,
            difficulty: difficulty?.[0] || 0,
            usefulness: usefulness?.[0] || 0,
            workload: workload?.[0] || 0,
            teaching: teaching?.[0] || 0,
            comment,
            timestamp: new Date(), // optional: store when the review was created
          };
      
          const reviewResponse = await CourseReviewsDAO.addReview(
            courseCode, // or use a unique courseId if you have one
            user,
            review
          );
      
          res.json({ status: "success" });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      }      

    //controller method to handle GET requests for course reviews
    static async apiGetReview(req, res, next) {
        try {
            /* 
            Getting the id from the URL path, ex. for a route like GET /api/v1/reviews/648ca.

            The purpose of the code: || {} is so that if req.params.id is undefined (ex. someone called the route incorrectly),
            then id becomes an empty object. 
            
            */
            let id = req.params.id || {}

            /* Calling the DAO method 'getReview' and passing in id. Then we will wait for the result. The review will be looked up
            in MongoDB within the DAO method I think */
            let review = await CourseReviewsDAO.getReview(id)

            //this if statement will handle the case where no review with that ID can be found
            if (!review) {
                //sending back the message HTTP 404 (Not Found) status with a helpful message
                res.status(404).json({error: "Not found"})
                return //using return to stop further execution
            }

            //if the review was found, sending it back as a JSON to the client
            res.json(review)
        }
        //error handling block
        catch (e) {
            //
            console.log(`api, ${e}`)
            res.status(500).json({ error: e })
        }
    }

    //controller method to handle PUT requests for course reviews
    //PUT requests are for updates, like editing an existing review
    static async apiUpdateReview(req, res, next) {
        //try block
        try {
            //extracting reviewId, review text, and username from the request body
            const reviewId = req.params.id //getting the :id part from the URL, ex. PUT /api/v1/reviews/658c983242df...
            const review = req.body.review //getting the updated review text
            const user = req.body.user //gettign the username of who is making the edit (used to verify permissions)

            //calling the updateReview DAO method to update the review in MongoDB
            const reviewResponse = await CourseReviewsDAO.updateReview(
                reviewId, //passing in the reviewID (which review to update)
                user, //passing in the username, ensuring that only the review's author can edit
                review //the new updated review
            )

            //this is object destructuring in JavaScript.
            //it basically means take the error property from the reviewResponse object and store it in a variable called 'error'
            var { error } = reviewResponse

            //if the DAO method returned an error, meaning error = not null or undefined,
            if (error) {
                /* respond with a status 400 Bad Request in JSON 
                { 
                    "error": "user does not match"
                } 
                
                This could happen if someone tried to update a review that didn't belong to them for example. The DAO would spot that
                and return an error object
                */
                res.status(400).json({error})
            }

            /* 
            
            modifiedCount is the number of documents that were actually updated by the PUT request. modifiedCount is part of the result
            object that gets returned by MongoDB's .updateOne(...) or .replaceOne(...) function. If you want to update a review,
            modifiedCount should increase by at least 1. However, if modifiedCount === 0, then that means either
            
            a) The review didn't exist
            b) User didn't match
            c) The new review text was identical, meaning that Mongo sees no change

            */
            if (reviewResponse.modifiedCount === 0) {
                //thus, throw a new error where it'll jump into the catch (e) block, preventing false success
                throw new Error (
                    "unable to update course review",
                )
            }

            //if everything went well, then we'll send a success response to the frontend
            res.json({ status: "success"})
        }
        //catch block for any runtime errors...this can include failed DB connection, DAO throws can exception or something being undefined
        catch (e) {
            //res.status sets the HTTP status code for the response object along with the .json
            res.status(500).json({error: e.message})
        }
    }

    //controller method to handle DELETE requests for reviews
    static async apiDeleteReview(req, res, next) {
        try {

            /* 
            retrieving the review ID from the request path ...ex front end sends DELETE /api/v1/reviews/5029342s, where 
            req.params.id === 5029342s
            */
            const reviewId = req.params.id 
            const reviewResponse = await CourseReviewsDAO.deleteReview(reviewId) //calling the DAO method to delete the review belonging to that reviewId
            
            /* 
            After calling that DAO deleteReview() function, you'll await its result. This is assuming that deleteReview() will:
            
            a) Find a review by ID
            b) Remove it from the database
            c) Return some kind of status object (will implement later...maybe)
            
            */
            if (reviewResponse.deletedCount === 0) {
                return res.status(404).json({ error: "Review not found" })
            }
            res.json({status: "success" })
        }

        catch (e) {
            res.status(500).json({error: e.message})
        }
    }

    //controller method to handle GET requests for specific user reviews
    static async apiGetReviews(req, res, next) {
        try {
            let id = req.params.id || {}
            let reviews = await CourseReviewsDAO.getReviewsByCourseId(id)
            if (!reviews) {
                res.status(404).json({error: "Not found"})
                return
            }
            res.json(reviews)
        } catch (e) {
            console.log(`api, ${e}`)
            res.status(500).json({error: e})
        }
    }
}