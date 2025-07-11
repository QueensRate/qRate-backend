import ProfessorReviewsDAO from "../dao/ProfessorReviewsDAO.js"

export default class ProfessorReviewsController {

  // POST a new professor review
  static async apiPostReview(req, res, next) {
    try {
      const {
        professorName,
        department,
        courseCode,
        term,
        overallRating,
        difficulty,
        helpfulness,
        clarity,
        wouldTakeAgain,
        comment,
        user
      } = req.body;

      if (
        !professorName || !department || !courseCode || !term || !comment || comment.trim().length < 50
      ) {
        return res.status(400).json({ error: "Missing or invalid required fields" });
      }

      const review = {
        professorName,
        department,
        courseCode,
        term,
        overallRating: overallRating ?? 0,
        difficulty: difficulty ?? 0,
        helpfulness: helpfulness ?? 0,
        clarity: clarity ?? 0,
        wouldTakeAgain: wouldTakeAgain ?? 0,
        comment,
        timestamp: new Date()
      };

      const reviewResponse = await ProfessorReviewsDAO.addReview(
        professorName,
        user,
        review
      );

      const { error } = reviewResponse;

      if (error) {
        return res.status(400).json({ error });
      }

      if (reviewResponse.modifiedCount === 0) {
        throw new Error("unable to update professor review");
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // GET a single professor review by ID
  static async apiGetReview(req, res, next) {
    try {
      let id = req.params.id || {};
      let review = await ProfessorReviewsDAO.getReview(id);

      if (!review) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      res.json(review);
    } catch (e) {
      console.log(`api, ${e}`);
      res.status(500).json({ error: e });
    }
  }

  // PUT (update) a professor review
  static async apiUpdateReview(req, res, next) {
    try {
      const reviewId = req.params.id;
      const review = req.body.review;
      const user = req.body.user;

      const reviewResponse = await ProfessorReviewsDAO.updateReview(
        reviewId,
        user,
        review
      );

      const { error } = reviewResponse;

      if (error) {
        return res.status(400).json({ error });
      }

      if (reviewResponse.modifiedCount === 0) {
        throw new Error("unable to update professor review");
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  // DELETE a professor review by ID
  static async apiDeleteReview(req, res, next) {
    try {
      const reviewId = req.params.id;
      const reviewResponse = await ProfessorReviewsDAO.deleteReview(reviewId);

      if (reviewResponse.deletedCount === 0) {
        return res.status(404).json({ error: "Review not found" });
      }

      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiSearchByName(req, res, next) {
    try {
      const name = req.query.name;
      if (!name) {
        return res.status(400).json({ error: "Missing professor name" });
      }
  
      const reviews = await ProfessorReviewsDAO.getReviewsByProfessorName(name);
  
      res.json(reviews || []);
    } catch (e) {
      console.error(`apiSearchByName error: ${e}`);
      res.status(500).json({ error: e.message });
    }
  }  
}
