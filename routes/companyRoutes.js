const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/companyController");
const { isCompany } = require("../middleware/authMiddleware");

router.use(isCompany);

router.get("/profile", CompanyController.getProfile);
router.post("/profile", CompanyController.postProfile);

router.get("/preferences", CompanyController.getPreferences);
router.post("/preferences", CompanyController.postPreferences);

router.get("/students", CompanyController.getAssignedStudents);
router.get("/students/cv/:studentId", CompanyController.downloadStudentCV);

module.exports = router;