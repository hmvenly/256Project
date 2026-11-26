const db = require("../config/db");

const AuthModel = {
  getAllDepartments: async () => {
    const [rows] = await db.query("SELECT * FROM departments ORDER BY name ASC");
    return rows;
  },

  findAdminByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM admins WHERE email = ?", [email]);
    return rows[0];
  },

  findStudentByEmailOrId: async (email, id) => {
    const [rows] = await db.query(
      "SELECT * FROM students WHERE email = ? OR id = ?",
      [email, id]
    );
    return rows[0];
  },

  findStudentByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM students WHERE email = ?", [email]);
    return rows[0];
  },

  createStudent: async ({ id, name, surname, email, department_id, password }) => {
    await db.query(
      "INSERT INTO students (id, name, surname, email, department_id, password) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, surname, email, department_id, password]
    );
  },

  findCompanyByEmail: async (email) => {
    const [rows] = await db.query("SELECT * FROM companies WHERE email = ?", [email]);
    return rows[0];
  },

  createCompany: async ({ company_name, rep_name, email, password }) => {
    await db.query(
      "INSERT INTO companies (company_name, rep_name, email, password) VALUES (?, ?, ?, ?)",
      [company_name, rep_name, email, password]
    );
  },
};

module.exports = AuthModel;