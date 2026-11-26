const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");

router.get("/", (req, res) => res.redirect("/login"));
router.get("/login", AuthController.getLogin);
router.post("/login", AuthController.postLogin);

router.get("/register/student", AuthController.getStudentRegister);
router.post("/register/student", AuthController.postStudentRegister);

router.get("/register/company", AuthController.getCompanyRegister);
router.post("/register/company", AuthController.postCompanyRegister);

router.get("/logout", AuthController.logout);

module.exports = router;