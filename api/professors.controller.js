import ProfessorsDAO from "../dao/ProfessorsDAO.js"; 

export default class ProfessorsController {
  // Handling requests for all professors on the browse professors page
  static async apiGetProfessors(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
      const { professors, totalCount } = await ProfessorsDAO.getProfessors({ page, limit });

      res.json({
        professors,
        totalCount
      });
    } catch (e) {
      console.error(`api error: ${e}`);
      res.status(500).json({ error: e.message });
    }
  }
}
