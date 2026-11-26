const bcrypt = require("bcryptjs");
const AuthModel = require("../models/authModel");

const AuthController = {
  getLogin: (req, res) => {
    res.render("auth/login", { error: null, formData: {} });
  },

  postLogin: async (req, res) => {
    const { role, email, password } = req.body;

    if (!role || !email || !password) {
      return res.render("auth/login", {
        error: "All fields are required.",
        formData: { role, email },
      });
    }

    try {
      let user = null;
      if (role === "admin") {
        user = await AuthModel.findAdminByEmail(email);
      } else if (role === "student") {
        user = await AuthModel.findStudentByEmail(email);
      } else if (role === "company") {
        user = await AuthModel.findCompanyByEmail(email);
      }

      if (!user) {
        return res.render("auth/login", {
          error: "Invalid email or password.",
          formData: { role, email },
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render("auth/login", {
          error: "Invalid email or password.",
          formData: { role, email },
        });
      }

      req.session.user = {
        id: user.id,
        role: role,
        email: user.email,
        name: user.name || user.company_name || "Admin",
      };

      if (role === "admin") return res.redirect("/admin/dashboard");
      if (role === "student") return res.redirect("/student/profile");
      if (role === "company") return res.redirect("/company/profile");
    } catch (err) {
      console.error(err);
      res.render("auth/login", {
        error: "Server error during login.",
        formData: { role, email },
      });
    }
  },

  getStudentRegister: async (req, res) => {
    const departments = await AuthModel.getAllDepartments();
    res.render("auth/register_student", { departments, error: null, formData: {} });
  },

  postStudentRegister: async (req, res) => {
    const { id, name, surname, email, department_id, password } = req.body;
    const departments = await AuthModel.getAllDepartments();

    if (!id || !name || !surname || !email || !department_id || !password) {
      return res.render("auth/register_student", {
        departments,
        error: "All fields are required.",
        formData: req.body,
      });
    }

    if (!email.endsWith("bilkent.edu.tr")) {
      return res.render("auth/register_student", {
        departments,
        error: "Please use a valid Bilkent email address.",
        formData: req.body,
      });
    }

    try {
      const existing = await AuthModel.findStudentByEmailOrId(email, id);
      if (existing) {
        return res.render("auth/register_student", {
          departments,
          error: "Student ID or email already registered.",
          formData: req.body,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await AuthModel.createStudent({
        id,
        name,
        surname,
        email,
        department_id,
        password: hashedPassword,
      });

      res.redirect("/login");
    } catch (err) {
      console.error(err);
      res.render("auth/register_student", {
        departments,
        error: "Registration failed.",
        formData: req.body,
      });
    }
  },

  getCompanyRegister: (req, res) => {
    res.render("auth/register_company", { error: null, formData: {} });
  },

  postCompanyRegister: async (req, res) => {
    const { company_name, rep_name, email, password } = req.body;

    if (!company_name || !rep_name || !email || !password) {
      return res.render("auth/register_company", {
        error: "All fields are required.",
        formData: req.body,
      });
    }

    try {
      const existing = await AuthModel.findCompanyByEmail(email);
      if (existing) {
        return res.render("auth/register_company", {
          error: "Company email already registered.",
          formData: req.body,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await AuthModel.createCompany({
        company_name,
        rep_name,
        email,
        password: hashedPassword,
      });

      res.redirect("/login");
    } catch (err) {
      console.error(err);
      res.render("auth/register_company", {
        error: "Company registration failed.",
        formData: req.body,
      });
    }
  },

  logout: (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  },
};

module.exports = AuthController;