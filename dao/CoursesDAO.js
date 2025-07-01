let coursesCollection;

export default class CoursesDAO {
  static async injectDB(conn) {
    if (coursesCollection) return;
    try {
      coursesCollection = await conn.db("qrate").collection("courses");
    } catch (e) {
      console.error(`Unable to establish collection handles: ${e}`);
    }
  }

  static async getCourses() {
  try {
    const cursor = await coursesCollection.find({});
    const courses = await cursor.toArray();

    // Normalize missing or null fields
    return courses.map(course => ({
      ...course,
      professor: course.professor ?? "Unknown",
      num_reviews: course.num_reviews ?? 0,
      num_rating: course.num_rating ?? "N/A",
      difficulty: course.difficulty ?? "N/A",
      usefulness: course.usefulness ?? "N/A",
      workload: course.workload ?? "N/A"
    }));
  } catch (e) {
    console.error(`Unable to fetch courses: ${e}`);
    return [];
  }
}
}
