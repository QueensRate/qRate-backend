let professorsCollection;
let reviewsCollection;

export default class ProfessorsDAO {
  static async injectDB(conn) {
    if (professorsCollection && reviewsCollection) return;
    try {
      professorsCollection = await conn.db("qrate").collection("professors");
      reviewsCollection = await conn.db("reviews").collection("professor-reviews");
    } catch (e) {
      console.error(`Unable to establish professors collection handle: ${e}`);
    }
  }

  static async getProfessors({ page = 1, limit = 10 }) {
    try {
      const skip = (page - 1) * limit;

      // Get total count before pagination
      const totalCount = await professorsCollection.countDocuments();

      // Get paginated professors
      const professors = await professorsCollection
        .find({})
        .skip(skip)
        .limit(limit)
        .toArray();

      // Get review stats
      const stats = await reviewsCollection.aggregate([
        {
          $group: {
            _id: "$review.professorName",
            reviews: { $sum: 1 },
            rating: { $avg: "$review.overallRating" },
            difficulty: { $avg: "$review.difficulty" },
            helpfulness: { $avg: "$review.helpfulness" },
            clarity: { $avg: "$review.clarity" },
          },
        },
      ]).toArray();

      // Create a lookup map for review stats
      const statsMap = stats.reduce((map, item) => {
        map[item._id] = item;
        return map;
      }, {});

      // Merge professor info with review stats
      const enrichedProfessors = professors.map((prof) => {
        const s = statsMap[prof.name] || {};
        return {
          id: prof._id,
          name: prof.name,
          courses_teaching: prof.courses_teaching || [],
          phone: prof.phone || "N/A",
          degrees: prof.degrees || "N/A",
          professor_type: prof.professor_type || "N/A",
          faculty: prof.faculty || "N/A",
          email: prof.email || "N/A",
          office: prof.office || "N/A",
          expertise: prof.expertise || [],
          biography: prof.biography || "Biography not available.",
          rating: s.rating ? s.rating.toFixed(1) : "N/A",
          difficulty: s.difficulty ? s.difficulty.toFixed(1) : "N/A",
          helpfulness: s.helpfulness ? s.helpfulness.toFixed(1) : "N/A",
          clarity: s.clarity ? s.clarity.toFixed(1) : "N/A",
          reviews: s.reviews || 0,
        };
      });

      return {
        professors: enrichedProfessors,
        totalCount,
      };
    } catch (e) {
      console.error(`Unable to fetch professors: ${e}`);
      return { professors: [], totalCount: 0 };
    }
  }
}
