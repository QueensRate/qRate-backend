import ProfessorsDAO from "../dao/ProfessorsDAO.js"; 

export default class ProfessorsController {

    // handling requests for all professors on the browse professors page
    static async apiGetProfessors(req, res, next) {
        
        try {
            const professors = await ProfessorsDAO.getProfessors();
            if (!professors) {
            res.status(404).json({ error: "Not found" });
            return;
            }
            res.json(professors);
        } catch (e) {
            console.log(`api error, ${e}`);
            res.status(500).json({ error: e.message });
        }
    }
}
