const db = require("../config/db");

const CompanyModel = {
  getCompanyById: async (companyId) => {
    const [rows] = await db.query("SELECT * FROM companies WHERE id = ?", [companyId]);
    return rows[0];
  },

  getAllDepartments: async () => {
    const [rows] = await db.query("SELECT * FROM departments ORDER BY name ASC");
    return rows;
  },

  getAllSectors: async () => {
    const [rows] = await db.query("SELECT * FROM sectors ORDER BY name ASC");
    return rows;
  },

  getCompanyDepartmentIds: async (companyId) => {
    const [rows] = await db.query(
      "SELECT department_id FROM company_departments WHERE company_id = ?",
      [companyId]
    );
    return rows.map((row) => row.department_id);
  },

  getCompanySectorIds: async (companyId) => {
    const [rows] = await db.query(
      "SELECT sector_id FROM company_sectors WHERE company_id = ?",
      [companyId]
    );
    return rows.map((row) => row.sector_id);
  },

  updateCompanyProfile: async (companyId, { company_name, rep_name, interview_language, description }) => {
    await db.query(
      "UPDATE companies SET company_name = ?, rep_name = ?, interview_language = ?, description = ? WHERE id = ?",
      [company_name, rep_name, interview_language, description, companyId]
    );
  },

  updateCompanyPreferences: async (companyId, { quota, min_cgpa, departmentIds, sectorIds }) => {
    await db.query(
      "UPDATE companies SET quota = ?, min_cgpa = ? WHERE id = ?",
      [quota, min_cgpa, companyId]
    );

    await db.query("DELETE FROM company_departments WHERE company_id = ?", [companyId]);
    for (const deptId of departmentIds) {
      await db.query(
        "INSERT INTO company_departments (company_id, department_id) VALUES (?, ?)",
        [companyId, deptId]
      );
    }

    await db.query("DELETE FROM company_sectors WHERE company_id = ?", [companyId]);
    for (const sectorId of sectorIds) {
      await db.query(
        "INSERT INTO company_sectors (company_id, sector_id) VALUES (?, ?)",
        [companyId, sectorId]
      );
    }
  },

  getAssignedStudents: async (companyId) => {
    const [rows] = await db.query(
      `SELECT s.id, s.name, s.surname, s.email, s.cgpa, s.interview_language, s.cv_path,
              d.name AS department_name
       FROM matches m
       JOIN students s ON m.student_id = s.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE m.company_id = ? AND m.is_finalized = TRUE
       ORDER BY s.evaluation_score DESC, s.name ASC`,
      [companyId]
    );
    return rows;
  },
};

module.exports = CompanyModel;