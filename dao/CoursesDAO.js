let coursesCollection;
let reviewsCollection; // Added to fetch related reviews

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

  static async getCourses() {
    try {
      const courses = await coursesCollection.find({}).toArray();

      const courseStats = await reviewsCollection.aggregate([
        {
          $group: {
            _id: "$courseId",
            num_reviews: { $sum: 1 },
            avg_rating: { $avg: "$overallRating" },
            difficulty: { $avg: "$difficulty" },
            usefulness: { $avg: "$usefulness" },
            workload: { $avg: "$workload" },
          },
        },
      ]).toArray();

      // Convert stats to map for easier lookup
      const statsMap = courseStats.reduce((map, stat) => {
        map[stat._id] = stat;
        return map;
      }, {});

      return courses.map(course => {
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
    } catch (e) {
      console.error(`Unable to fetch courses: ${e}`);
      return [];
    }
  }
}
