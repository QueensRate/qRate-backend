import CoursesDAO from "../dao/CoursesDAO.js"; 

export default class CoursesController {

    static async apiGetCourses(req, res, next) {
        console.log("🔍 GET /api/v1/courses hit");

        try {
            const courses = await CoursesDAO.getCourses();
            if (!courses) {
            res.status(404).json({ error: "Not found" });
            return;
            }
            res.json(courses);
        } catch (e) {
            console.log(`api error, ${e}`);
            res.status(500).json({ error: e.message });
        }
    }
}
