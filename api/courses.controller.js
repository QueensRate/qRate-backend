import CoursesDAO from "../dao/CoursesDAO.js";

export default class CoursesController {
    static async apiGetCourses(req, res) {
        try {
            const courses = await CoursesDAO.getAllCourses();
            res.json(courses);
        } catch (e) {
            console.error("Error ")
        }
    }

}