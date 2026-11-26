const bcrypt = require("bcryptjs");
const AdminModel = require("../models/adminModel");

const AdminController = {
  getDashboard: async (req, res) => {
    const reports = await AdminModel.getReports();
    res.render("admin/dashboard", { reports });
  },

  getDepartments: async (req, res) => {
    const departments = await AdminModel.getAllDepartments();
    res.render("admin/departments", { departments, error: null, formData: {} });
  },

  postAddDepartment: async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      const departments = await AdminModel.getAllDepartments();
      return res.render("admin/departments", {
        departments,
        error: "Department name is required.",
        formData: req.body,
      });
    }
    try {
      await AdminModel.addDepartment(name.trim());
      res.redirect("/admin/departments");
    } catch (err) {
      const departments = await AdminModel.getAllDepartments();
      res.render("admin/departments", {
        departments,
        error: "Department already exists or invalid input.",
        formData: req.body,
      });
    }
  },

  postUpdateDepartment: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (name && name.trim()) {
      await AdminModel.updateDepartment(id, name.trim());
    }
    res.redirect("/admin/departments");
  },

  postDeleteDepartment: async (req, res) => {
    await AdminModel.deleteDepartment(req.params.id);
    res.redirect("/admin/departments");
  },

  getSectors: async (req, res) => {
    const sectors = await AdminModel.getAllSectors();
    res.render("admin/sectors", { sectors, error: null, formData: {} });
  },

  postAddSector: async (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
      const sectors = await AdminModel.getAllSectors();
      return res.render("admin/sectors", {
        sectors,
        error: "Sector name is required.",
        formData: req.body,
      });
    }
    try {
      await AdminModel.addSector(name.trim());
      res.redirect("/admin/sectors");
    } catch (err) {
      const sectors = await AdminModel.getAllSectors();
      res.render("admin/sectors", {
        sectors,
        error: "Sector already exists or invalid input.",
        formData: req.body,
      });
    }
  },

  postUpdateSector: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (name && name.trim()) {
      await AdminModel.updateSector(id, name.trim());
    }
    res.redirect("/admin/sectors");
  },

  postDeleteSector: async (req, res) => {
    await AdminModel.deleteSector(req.params.id);
    res.redirect("/admin/sectors");
  },

  getCompanies: async (req, res) => {
    const companies = await AdminModel.getAllCompanies();
    res.render("admin/companies", { companies, error: null, formData: {} });
  },

  postAddCompany: async (req, res) => {
    const { company_name, rep_name, email, password, interview_language, description, quota, min_cgpa } = req.body;
    if (!company_name || !rep_name || !email || !password) {
      const companies = await AdminModel.getAllCompanies();
      return res.render("admin/companies", {
        companies,
        error: "Company name, representative, email, and password are required.",
        formData: req.body,
      });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await AdminModel.addCompany({
        company_name,
        rep_name,
        email,
        password: hashedPassword,
        interview_language,
        description,
        quota: parseInt(quota, 10) || 0,
        min_cgpa: min_cgpa ? parseFloat(min_cgpa) : null,
      });
      res.redirect("/admin/companies");
    } catch (err) {
      const companies = await AdminModel.getAllCompanies();
      res.render("admin/companies", {
        companies,
        error: "Could not add company. Email may already exist.",
        formData: req.body,
      });
    }
  },

  postUpdateCompany: async (req, res) => {
    const { id } = req.params;
    const { company_name, rep_name, email, interview_language, description, quota, min_cgpa } = req.body;
    if (company_name && rep_name && email) {
      await AdminModel.updateCompany(id, {
        company_name,
        rep_name,
        email,
        interview_language,
        description,
        quota: parseInt(quota, 10) || 0,
        min_cgpa: min_cgpa ? parseFloat(min_cgpa) : null,
      });
    }
    res.redirect("/admin/companies");
  },

  postDeleteCompany: async (req, res) => {
    await AdminModel.deleteCompany(req.params.id);
    res.redirect("/admin/companies");
  },

  getStudents: async (req, res) => {
    const students = await AdminModel.getAllStudents();
    res.render("admin/students", { students, error: null });
  },

  postEvaluateStudent: async (req, res) => {
    const { id } = req.params;
    const score = parseInt(req.body.evaluation_score, 10);
    if (isNaN(score) || score < 0 || score > 100) {
      const students = await AdminModel.getAllStudents();
      return res.render("admin/students", {
        students,
        error: "Evaluation score must be between 0 and 100.",
      });
    }
    await AdminModel.updateStudentScore(id, score);
    res.redirect("/admin/students");
  },

  getMatching: async (req, res) => {
    const matches = await AdminModel.getAllMatches();
    const students = await AdminModel.getAllStudents();
    const companies = await AdminModel.getAllCompanies();
    res.render("admin/matching", { matches, students, companies, error: null });
  },

  postRunMatching: async (req, res) => {
    const { students, studentSectors, companies, companySectors, companyDepartments } = await AdminModel.getMatchingData();

    await AdminModel.clearUnfinalizedMatches();

    const studentSectorMap = {};
    studentSectors.forEach((row) => {
      if (!studentSectorMap[row.student_id]) studentSectorMap[row.student_id] = [];
      studentSectorMap[row.student_id].push(row.sector_id);
    });

    for (const company of companies) {
      const compSectors = companySectors
        .filter((cs) => cs.company_id === company.id)
        .map((cs) => cs.sector_id);

      const compDepts = companyDepartments
        .filter((cd) => cd.company_id === company.id)
        .map((cd) => cd.department_id);

      const eligibleStudents = students.filter((student) => {
        const sSectors = studentSectorMap[student.id] || [];
        const hasSectorMatch = sSectors.some((secId) => compSectors.includes(secId));
        if (!hasSectorMatch) return false;

        if (company.min_cgpa !== null && (student.cgpa === null || Number(student.cgpa) < Number(company.min_cgpa))) {
          return false;
        }

        return true;
      });

      eligibleStudents.sort((a, b) => {
        const aPrefDept = compDepts.includes(a.department_id) ? 1 : 0;
        const bPrefDept = compDepts.includes(b.department_id) ? 1 : 0;
        if (bPrefDept !== aPrefDept) return bPrefDept - aPrefDept;

        const aLangMatch = a.interview_language === company.interview_language ? 1 : 0;
        const bLangMatch = b.interview_language === company.interview_language ? 1 : 0;
        if (bLangMatch !== aLangMatch) return bLangMatch - aLangMatch;

        return (b.evaluation_score || 0) - (a.evaluation_score || 0);
      });

      const selected = eligibleStudents.slice(0, company.quota);
      for (const student of selected) {
        await AdminModel.insertMatch(student.id, company.id);
      }
    }

    res.redirect("/admin/matching");
  },

  postAddManualMatch: async (req, res) => {
    const { student_id, company_id } = req.body;
    if (student_id && company_id) {
      await AdminModel.insertMatch(student_id, company_id);
    }
    res.redirect("/admin/matching");
  },

  postDeleteMatch: async (req, res) => {
    await AdminModel.deleteMatch(req.params.id);
    res.redirect("/admin/matching");
  },

  postFinalizeMatches: async (req, res) => {
    await AdminModel.finalizeAllMatches();
    res.redirect("/admin/matching");
  },

  getReports: async (req, res) => {
    const reports = await AdminModel.getReports();
    res.render("admin/reports", { reports });
  },
};

module.exports = AdminController;