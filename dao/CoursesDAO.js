import { ObjectId } from "mongodb";

let coursesCollection;
let reviewsCollection;

export default class CoursesDAO {
  static async injectDB(conn) {
    if (coursesCollection && reviewsCollection) return;
    try {
      coursesCollection = await conn.db("qrate").collection("courses");
      reviewsCollection = await conn.db("reviews").collection("reviews");
    } catch (e) {
      console.error(`Unable to establish collection handles: ${e}`);
    }
  }

  static async getCourses({ page = 1, limit = 10 } = {}) {
    try {
      const skip = (page - 1) * limit;

      const coursesCursor = await coursesCollection
        .find({})
        .skip(skip)
        .limit(parseInt(limit));

      const courses = await coursesCursor.toArray();
      const totalCount = await coursesCollection.countDocuments();

      // Aggregate review stats grouped by courseId (course.code)
      const courseStats = await reviewsCollection.aggregate([
        {
          $match: {
            "review.overallRating": { $exists: true, $gt: 0 }
          }
        },
        {
          $group: {
            _id: "$courseId",
            num_reviews: { $sum: 1 },
            avg_rating: { $avg: "$review.overallRating" },
            difficulty: { $avg: "$review.difficulty" },
            usefulness: { $avg: "$review.usefulness" },
            workload: { $avg: "$review.workload" },
          }
        }
      ]).toArray();

      // Map stats to course codes
      const statsMap = courseStats.reduce((map, stat) => {
        map[stat._id] = stat;
        return map;
      }, {});

      // Merge stats into courses
      const enrichedCourses = courses.map(course => {
        const stats = statsMap[course.code] || {};
        return {
          ...course,
          professor: course.professor ?? "Unknown",
          num_reviews: stats.num_reviews ?? 0,
          avg_rating: stats.avg_rating ? stats.avg_rating.toFixed(1) : "N/A",
          difficulty: stats.difficulty ? stats.difficulty.toFixed(1) : "N/A",
          usefulness: stats.usefulness ? stats.usefulness.toFixed(1) : "N/A",
          workload: stats.workload ? stats.workload.toFixed(1) : "N/A",
        };
      });

      return { courses: enrichedCourses, totalCount };
    } catch (e) {
      console.error(`Unable to fetch courses: ${e}`);
      return { courses: [], totalCount: 0 };
    }
  }

  static async getCourseById(id) {
    try {
      const course = await coursesCollection.findOne({ _id: new ObjectId(id) });
      if (!course) return null;

      const stats = await reviewsCollection.aggregate([
        { $match: { courseId: course.code } },
        {
          $group: {
            _id: "$courseId",
            avg_rating: { $avg: "$review.overallRating" },
            difficulty: { $avg: "$review.difficulty" },
            usefulness: { $avg: "$review.usefulness" },
            workload: { $avg: "$review.workload" },
            teaching: { $avg: "$review.teaching" },
            totalReviews: { $sum: 1 },
            ratingDistribution: {
              $push: "$review.overallRating"
            }
          }
        }
      ]).toArray();

      const stat = stats[0] || {};
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      if (stat.ratingDistribution) {
        stat.ratingDistribution.forEach(rating => {
          const rounded = Math.round(rating);
          distribution[rounded] = (distribution[rounded] || 0) + 1;
        });
      }

      const reviews = await reviewsCollection.find({ courseId: course.code }).toArray();

      return {
        ...course,
        ratings: {
          overall: stat.avg_rating?.toFixed(1) || "N/A",
          difficulty: stat.difficulty?.toFixed(1) || "N/A",
          usefulness: stat.usefulness?.toFixed(1) || "N/A",
          workload: stat.workload?.toFixed(1) || "N/A",
          teaching: stat.teaching?.toFixed(1) || "N/A",
        },
        totalReviews: stat.totalReviews || 0,
        ratingDistribution: distribution,
        reviews: reviews.map(r => ({
          id: r._id,
          rating: r.review?.overallRating,
          difficulty: r.review?.difficulty,
          usefulness: r.review?.usefulness,
          workload: r.review?.workload,
          teaching: r.review?.teaching,
          comment: r.review?.comment,
          instructor: r.review?.instructor,
          term: r.review?.term,
          date: new Date(r.review?.timestamp).toLocaleDateString(),
          helpful: r.helpful || 0,
          notHelpful: r.notHelpful || 0,
        })),
      };
    } catch (e) {
      console.error(`Unable to get course by ID: ${e}`);
      return null;
    }
  }
}
