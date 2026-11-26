const db = require("../config/db");

const StudentModel = {
  getStudentById: async (studentId) => {
    const [rows] = await db.query(
      `SELECT s.*, d.name AS department_name
       FROM students s
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.id = ?`,
      [studentId]
    );
    return rows[0];
  },

  getAllSectors: async () => {
    const [rows] = await db.query("SELECT * FROM sectors ORDER BY name ASC");
    return rows;
  },

  getStudentSectorIds: async (studentId) => {
    const [rows] = await db.query(
      "SELECT sector_id FROM student_sectors WHERE student_id = ?",
      [studentId]
    );
    return rows.map((row) => row.sector_id);
  },

  updateStudentProfile: async (studentId, { cgpa, interview_language, sectorIds }) => {
    await db.query(
      "UPDATE students SET cgpa = ?, interview_language = ? WHERE id = ?",
      [cgpa, interview_language, studentId]
    );

    await db.query("DELETE FROM student_sectors WHERE student_id = ?", [studentId]);

    for (const sectorId of sectorIds) {
      await db.query(
        "INSERT INTO student_sectors (student_id, sector_id) VALUES (?, ?)",
        [studentId, sectorId]
      );
    }
  },

  updateStudentCV: async (studentId, cvPath) => {
    await db.query("UPDATE students SET cv_path = ? WHERE id = ?", [cvPath, studentId]);
  },

  getFinalizedMatches: async (studentId) => {
    const [rows] = await db.query(
      `SELECT c.id, c.company_name, c.rep_name, c.email, c.interview_language, c.description
       FROM matches m
       JOIN companies c ON m.company_id = c.id
       WHERE m.student_id = ? AND m.is_finalized = TRUE
       ORDER BY c.company_name ASC`,
      [studentId]
    );
    return rows;
  },
};

module.exports = StudentModel;