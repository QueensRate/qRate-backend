let professorsCollection;

export default class ProfessorsDAO {
  static async injectDB(conn) {
    if (professorsCollection) return;
    try {
      professorsCollection = await conn.db("qrate").collection("professors");
    } catch (e) {
      console.error(`Unable to establish professors collection handle: ${e}`);
    }
  }

  static async getProfessors() {
    try {
      const professors = await professorsCollection.find({}).toArray();

      return professors.map((prof) => ({
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
      }));
    } catch (e) {
      console.error(`Unable to fetch professors: ${e}`);
      return [];
    }
  }
}
