const path = require("path");
const fs = require("fs");
const CompanyModel = require("../models/companyModel");

const CompanyController = {
  getProfile: async (req, res) => {
    const companyId = req.session.user.id;
    const company = await CompanyModel.getCompanyById(companyId);

    res.render("company/profile", {
      company,
      error: null,
      success: null,
      formData: company,
    });
  },

  postProfile: async (req, res) => {
    const companyId = req.session.user.id;
    const { company_name, rep_name, interview_language, description } = req.body;
    const company = await CompanyModel.getCompanyById(companyId);

    if (!company_name || !company_name.trim() || !rep_name || !rep_name.trim() || !interview_language || !interview_language.trim()) {
      return res.render("company/profile", {
        company,
        error: "Company name, representative name, and interview language are required.",
        success: null,
        formData: req.body,
      });
    }

    try {
      await CompanyModel.updateCompanyProfile(companyId, {
        company_name: company_name.trim(),
        rep_name: rep_name.trim(),
        interview_language: interview_language.trim(),
        description: description ? description.trim() : "",
      });

      req.session.user.name = company_name.trim();
      const updatedCompany = await CompanyModel.getCompanyById(companyId);

      res.render("company/profile", {
        company: updatedCompany,
        error: null,
        success: "Company profile updated successfully.",
        formData: updatedCompany,
      });
    } catch (err) {
      console.error(err);
      res.render("company/profile", {
        company,
        error: "Failed to update company profile.",
        success: null,
        formData: req.body,
      });
    }
  },

  getPreferences: async (req, res) => {
    const companyId = req.session.user.id;
    const company = await CompanyModel.getCompanyById(companyId);
    const departments = await CompanyModel.getAllDepartments();
    const sectors = await CompanyModel.getAllSectors();
    const selectedDepartments = await CompanyModel.getCompanyDepartmentIds(companyId);
    const selectedSectors = await CompanyModel.getCompanySectorIds(companyId);

    res.render("company/preferences", {
      company,
      departments,
      sectors,
      selectedDepartments,
      selectedSectors,
      error: null,
      success: null,
      formData: {
        quota: company.quota,
        min_cgpa: company.min_cgpa,
        departments: selectedDepartments.map(String),
        sectors: selectedSectors.map(String),
      },
    });
  },

  postPreferences: async (req, res) => {
    const companyId = req.session.user.id;
    const { quota, min_cgpa } = req.body;

    let departmentsInput = req.body.departments || [];
    if (!Array.isArray(departmentsInput)) departmentsInput = [departmentsInput];

    let sectorsInput = req.body.sectors || [];
    if (!Array.isArray(sectorsInput)) sectorsInput = [sectorsInput];

    const company = await CompanyModel.getCompanyById(companyId);
    const departments = await CompanyModel.getAllDepartments();
    const sectors = await CompanyModel.getAllSectors();

    const parsedQuota = parseInt(quota, 10);
    if (isNaN(parsedQuota) || parsedQuota < 1) {
      return res.render("company/preferences", {
        company,
        departments,
        sectors,
        selectedDepartments: departmentsInput.map(Number),
        selectedSectors: sectorsInput.map(Number),
        error: "Interview quota must be at least 1.",
        success: null,
        formData: { quota, min_cgpa, departments: departmentsInput, sectors: sectorsInput },
      });
    }

    let parsedMinCgpa = null;
    if (min_cgpa && min_cgpa.trim() !== "") {
      parsedMinCgpa = parseFloat(min_cgpa);
      if (isNaN(parsedMinCgpa) || parsedMinCgpa < 0 || parsedMinCgpa > 4.0) {
        return res.render("company/preferences", {
          company,
          departments,
          sectors,
          selectedDepartments: departmentsInput.map(Number),
          selectedSectors: sectorsInput.map(Number),
          error: "Minimum CGPA must be between 0.00 and 4.00.",
          success: null,
          formData: { quota, min_cgpa, departments: departmentsInput, sectors: sectorsInput },
        });
      }
      parsedMinCgpa = parsedMinCgpa.toFixed(2);
    }

    if (sectorsInput.length === 0) {
      return res.render("company/preferences", {
        company,
        departments,
        sectors,
        selectedDepartments: departmentsInput.map(Number),
        selectedSectors: sectorsInput.map(Number),
        error: "Please select at least one preferred sector.",
        success: null,
        formData: { quota, min_cgpa, departments: departmentsInput, sectors: sectorsInput },
      });
    }

    try {
      await CompanyModel.updateCompanyPreferences(companyId, {
        quota: parsedQuota,
        min_cgpa: parsedMinCgpa,
        departmentIds: departmentsInput.map(Number),
        sectorIds: sectorsInput.map(Number),
      });

      const updatedCompany = await CompanyModel.getCompanyById(companyId);
      const updatedDepts = await CompanyModel.getCompanyDepartmentIds(companyId);
      const updatedSectors = await CompanyModel.getCompanySectorIds(companyId);

      res.render("company/preferences", {
        company: updatedCompany,
        departments,
        sectors,
        selectedDepartments: updatedDepts,
        selectedSectors: updatedSectors,
        error: null,
        success: "Interview preferences updated successfully.",
        formData: {
          quota: updatedCompany.quota,
          min_cgpa: updatedCompany.min_cgpa,
          departments: updatedDepts.map(String),
          sectors: updatedSectors.map(String),
        },
      });
    } catch (err) {
      console.error(err);
      res.render("company/preferences", {
        company,
        departments,
        sectors,
        selectedDepartments: departmentsInput.map(Number),
        selectedSectors: sectorsInput.map(Number),
        error: "Failed to update interview preferences.",
        success: null,
        formData: { quota, min_cgpa, departments: departmentsInput, sectors: sectorsInput },
      });
    }
  },

  getAssignedStudents: async (req, res) => {
    const companyId = req.session.user.id;
    const students = await CompanyModel.getAssignedStudents(companyId);
    res.render("company/students", { students });
  },

  downloadStudentCV: async (req, res) => {
    const companyId = req.session.user.id;
    const { studentId } = req.params;
    const assignedStudents = await CompanyModel.getAssignedStudents(companyId);
    const student = assignedStudents.find((s) => s.id === studentId);

    if (!student || !student.cv_path) {
      return res.status(404).send("CV not found or access denied.");
    }

    const filePath = path.join(__dirname, "../public", student.cv_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("CV file missing on server.");
    }

    res.download(filePath, `${student.name}_${student.surname}_CV.pdf`);
  },
};

module.exports = CompanyController;