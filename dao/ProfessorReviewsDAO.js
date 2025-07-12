import mongodb from "mongodb"

const ObjectId = mongodb.ObjectId

let professorReviews // global variable to store the MongoDB collection reference

export default class ProfessorReviewsDAO {

  // Initialize the database connection and get the "professor-reviews" collection
  static async injectDB(conn) {
    if (professorReviews) {
      return
    }
    try {
      professorReviews = await conn.db("reviews").collection("professor-reviews")
    } catch (e) {
      console.error(`Unable to establish collection handles in ProfessorReviewsDAO: ${e}`)
    }
  }

  // Add a new professor review
  static async addReview(professorName, user, review) {
    try {
      const reviewDoc = {
        professorName: professorName,
        user: user,
        review: review
      }

      return await professorReviews.insertOne(reviewDoc)
    } catch (e) {
      console.error(`Unable to post professor review: ${e}`)
      return { error: e }
    }
  }

  // Get a single review by its ObjectId
  static async getReview(reviewId) {
    try {
      return await professorReviews.findOne({ _id: ObjectId(reviewId) })
    } catch (e) {
      console.error(`Unable to get professor review: ${e}`)
      return { error: e }
    }
  }

  // Update a professor review by ID
  static async updateReview(reviewId, user, review) {
    try {
      const updateResponse = await professorReviews.updateOne(
        { _id: ObjectId(reviewId) },
        { $set: { user: user, review: review } }
      )

      return updateResponse
    } catch (e) {
      console.error(`Unable to update professor review: ${e}`)
      return { error: e }
    }
  }

  // Delete a professor review by ID
  static async deleteReview(reviewId) {
    try {
      const deleteResponse = await professorReviews.deleteOne({
        _id: ObjectId(reviewId)
      })

      return deleteResponse
    } catch (e) {
      console.error(`Unable to delete professor review: ${e}`)
      return { error: e }
    }
  }

  // Get all reviews for a specific professor
  static async getReviewsByProfessorName(professorName) {
    try {
      const cursor = await professorReviews.find({ professorName: professorName })
      return cursor.toArray()
    } catch (e) {
      console.error(`Unable to get reviews for professor: ${e}`)
      return { error: e }
    }
  }
}
