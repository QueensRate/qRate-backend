import CoursesDAO from "../dao/CoursesDAO.js"; 

export default class CoursesController {
  
  // handling requests for all courses on the browse courses page (paginated)
  static async apiGetCourses(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const { courses, totalCount } = await CoursesDAO.getCourses({ page, limit });

      res.json({ courses, totalCount });
    } catch (e) {
      console.log(`api error: ${e}`);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  }

  // handling requests for course data with a specific course id
  static async apiGetCourseById(req, res, next) {
    try {
      const courseId = req.params.id;
      const course = await CoursesDAO.getCourseById(courseId);

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      res.json(course);
    } catch (error) {
      console.error(`Failed to fetch course by ID: ${error}`);
      res.status(500).json({ error: "Server error" });
    }
  }
}
