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
      return courses;
    } catch (e) {
      console.error(`Unable to fetch courses: ${e}`);
      return [];
    }
  }
}
