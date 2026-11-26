const db = require("../config/db");

const AdminModel = {
  getAllDepartments: async () => {
    const [rows] = await db.query("SELECT * FROM departments ORDER BY name ASC");
    return rows;
  },

  addDepartment: async (name) => {
    await db.query("INSERT INTO departments (name) VALUES (?)", [name]);
  },

  updateDepartment: async (id, name) => {
    await db.query("UPDATE departments SET name = ? WHERE id = ?", [name, id]);
  },

  deleteDepartment: async (id) => {
    await db.query("DELETE FROM departments WHERE id = ?", [id]);
  },

  getAllSectors: async () => {
    const [rows] = await db.query("SELECT * FROM sectors ORDER BY name ASC");
    return rows;
  },

  addSector: async (name) => {
    await db.query("INSERT INTO sectors (name) VALUES (?)", [name]);
  },

  updateSector: async (id, name) => {
    await db.query("UPDATE sectors SET name = ? WHERE id = ?", [name, id]);
  },

  deleteSector: async (id) => {
    await db.query("DELETE FROM sectors WHERE id = ?", [id]);
  },

  getAllCompanies: async () => {
    const [rows] = await db.query("SELECT * FROM companies ORDER BY company_name ASC");
    return rows;
  },

  addCompany: async ({ company_name, rep_name, email, password, interview_language, description, quota, min_cgpa }) => {
    await db.query(
      "INSERT INTO companies (company_name, rep_name, email, password, interview_language, description, quota, min_cgpa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [company_name, rep_name, email, password, interview_language || "English", description || "", quota || 0, min_cgpa || null]
    );
  },

  updateCompany: async (id, { company_name, rep_name, email, interview_language, description, quota, min_cgpa }) => {
    await db.query(
      "UPDATE companies SET company_name = ?, rep_name = ?, email = ?, interview_language = ?, description = ?, quota = ?, min_cgpa = ? WHERE id = ?",
      [company_name, rep_name, email, interview_language, description, quota, min_cgpa || null, id]
    );
  },

  deleteCompany: async (id) => {
    await db.query("DELETE FROM companies WHERE id = ?", [id]);
  },

  getAllStudents: async () => {
    const [rows] = await db.query(`
      SELECT s.*, d.name AS department_name
      FROM students s
      LEFT JOIN departments d ON s.department_id = d.id
      ORDER BY s.evaluation_score DESC, s.name ASC
    `);
    return rows;
  },

  updateStudentScore: async (studentId, score) => {
    await db.query("UPDATE students SET evaluation_score = ? WHERE id = ?", [score, studentId]);
  },

  getMatchingData: async () => {
    const [students] = await db.query("SELECT * FROM students WHERE evaluation_score IS NOT NULL ORDER BY evaluation_score DESC");
    const [studentSectors] = await db.query("SELECT * FROM student_sectors");
    const [companies] = await db.query("SELECT * FROM companies WHERE quota > 0 ORDER BY id ASC");
    const [companySectors] = await db.query("SELECT * FROM company_sectors");
    const [companyDepartments] = await db.query("SELECT * FROM company_departments");
    return { students, studentSectors, companies, companySectors, companyDepartments };
  },

  clearUnfinalizedMatches: async () => {
    await db.query("DELETE FROM matches WHERE is_finalized = FALSE");
  },

  insertMatch: async (student_id, company_id) => {
    await db.query(
      "INSERT IGNORE INTO matches (student_id, company_id, is_finalized) VALUES (?, ?, FALSE)",
      [student_id, company_id]
    );
  },

  deleteMatch: async (matchId) => {
    await db.query("DELETE FROM matches WHERE id = ?", [matchId]);
  },

  finalizeAllMatches: async () => {
    await db.query("UPDATE matches SET is_finalized = TRUE");
  },

  getAllMatches: async () => {
    const [rows] = await db.query(`
      SELECT m.id, m.student_id, m.company_id, m.is_finalized,
             s.name AS student_name, s.surname AS student_surname, s.cgpa, s.evaluation_score,
             d.name AS department_name, c.company_name, c.quota
      FROM matches m
      JOIN students s ON m.student_id = s.id
      LEFT JOIN departments d ON s.department_id = d.id
      JOIN companies c ON m.company_id = c.id
      ORDER BY c.company_name ASC, s.evaluation_score DESC
    `);
    return rows;
  },

  getReports: async () => {
    const [[{ totalStudents }]] = await db.query("SELECT COUNT(*) AS totalStudents FROM students");
    const [[{ totalCompanies }]] = await db.query("SELECT COUNT(*) AS totalCompanies FROM companies");
    const [[{ matchedStudents }]] = await db.query("SELECT COUNT(DISTINCT student_id) AS matchedStudents FROM matches");

    const [companyQuotas] = await db.query(`
      SELECT c.id, c.company_name, c.quota, COUNT(m.id) AS filled, (c.quota - COUNT(m.id)) AS remaining
      FROM companies c
      LEFT JOIN matches m ON c.id = m.company_id
      GROUP BY c.id
    `);

    const [departmentStats] = await db.query(`
      SELECT d.name, COUNT(DISTINCT s.id) AS student_count, COUNT(DISTINCT m.student_id) AS matched_count
      FROM departments d
      LEFT JOIN students s ON d.id = s.department_id
      LEFT JOIN matches m ON s.id = m.student_id
      GROUP BY d.id
    `);

    const [sectorStats] = await db.query(`
      SELECT sec.name,
             COUNT(DISTINCT ss.student_id) AS interested_students,
             COUNT(DISTINCT cs.company_id) AS interested_companies
      FROM sectors sec
      LEFT JOIN student_sectors ss ON sec.id = ss.sector_id
      LEFT JOIN company_sectors cs ON sec.id = cs.sector_id
      GROUP BY sec.id
    `);

    return {
      totalStudents,
      totalCompanies,
      matchedStudents,
      companyQuotas,
      departmentStats,
      sectorStats,
    };
  },
};

module.exports = AdminModel;