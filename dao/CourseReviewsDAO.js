import mongodb from "mongodb" //importing the mongodb driver so we can access MongoDB objects and utilities like MongoClient and ObjectId

/* 
objectID is a special type used by mongoDB for document IDs, you need ObjectId to query documents by their IDs
since IDs in MongoDB are not strings but ObjectId objects
*/
const ObjectId = mongodb.ObjectId 

//declaring a global variable called "reviews" which stores the MongoDB collection reference once initialized
//kept outside the class so all the static methods in the class can use it w/o requerying the DB
let reviews 

//defining an exportable class called CourseReviewsDAO which will directly access the mongoDB database
export default class CourseReviewsDAO {

    /* 
    this is a method to connect to the MongoDB database...it also stores the reviews 
    collection in the shared reviews variable for all DAO methods
    */
    static async injectDB(conn) {
        //if the reviews variable has already been initialized, i.e it contains the value of the MongoDB collection reference we skip setup
        //in simpler terms, if there is a database connection
        if (reviews) {
            return //skip the setup
        }
        //try block
        try {
            //pauses the function until the promise from MongoDB resolves, where it gets the database called "reviews" and gets the collection named "reviews"
            reviews = await conn.db("reviews").collection("reviews")
        } 
        //if any of the above fails, we log an error
        catch (e) {
            console.error(`Unable to establish collection handles in CourseReviewsDAO: ${e}`)
        }
    }

    //static method called addReview which adds a new document to the reviews collection
    //parameters are courseId (ID of the course...can be string or int), user (username), review (actual review content)
    static async addReview(courseId, user, review) {
        //try block 
        try {
            //creates a new JS object to represent a review document where the keys courseId, user, and review become fields in the MongoDB document
            const reviewDoc = {
                courseId: courseId,
                user: user,
                review: review,
            }
            console.log("adding") //console logginf for debugging

            //inserts the reviewDoc into MongoDB using insertOne(), await waits until insert is done
            //insertOne() will insert a document into a collection in your database
            return await reviews.insertOne(reviewDoc) 
        }
        //catch block for any potential errors
        catch (e) {
            //logging error, and returning an option with an error key
            console.error(`Unable to post review: ${e}`)
            return { error: e }
        }
    }

    //get review method which retrieves a single review document by its "_id" value
    static async getReview(reviewId) {
        //try block
        try {
            //converts the reviewId into an ObjectId and queries the collection for the document with that _id value
            //findOne(...) will return the first matching document (or null if none have been found)
            return await reviews.findOne({ _id: ObjectId(reviewId) })
        }
        catch (e) {
            //error logging
            console.error(`Unable to get review: ${e}`)
            return { error: e }
        }
    }

    //update review method where we update a review's content and user field
    static async updateReview(reviewId, user, review) {
        //try block
        try {
            //this is a variable where we filter by the specific reviewId we want (using ObjectId to convert)
            //we then update using $set which tells MongoDB to overwrite only those specific fields
            //the method updateOne() will find the first document that matches the filter, and applied the specified update modifications
            const updateResponse = await reviews.updateOne(
                //this is the document we're searching for
                { _id: ObjectId(reviewId) },
                //setting the user to user, and review to be the new review
                { $set: { user: user, review: review } }
            )
            //sends the update result back to the controller
            return updateResponse
        }
        catch (e) {
            //error logging
            console.error(`Unable to update review: ${e}`)
            return { error: e }
        }
    }

    //delete review method
    static async deleteReview(reviewId) {
        //try block
        try {
            //creating a variable "deleteResponse" where we search for the document in the collection with a specific _id
            const deleteResponse = await reviews.deleteOne({
                _id: ObjectId(reviewId),
            })
            //we will then return the result back to the controller
            return deleteResponse
        }
        catch (e) {
            console.error(`Unable to delete review: ${e}`)
            return { error: e }
        }
    }

    // method which returns all reviews for a specific course
    static async getReviewsByCourseId(courseId) {
        try {
            //creating a variable called cursor which finds all documents in the collection with the parameters of the specific course
            //we use find() which will return a pointer to a list of all results
            const cursor = await reviews.find({ courseId: parseInt(courseId) })

            //converts the pointer to the list into an array of review documents and returns them
            return cursor.toArray()
        }
        catch (e) {
            //error logging
            console.error(`Unable to get review: ${e}`)
            return { error: e }
        }
    }
}