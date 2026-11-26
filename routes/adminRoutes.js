const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/adminController");
const { isAdmin } = require("../middleware/authMiddleware");

router.use(isAdmin);

router.get("/dashboard", AdminController.getDashboard);

router.get("/departments", AdminController.getDepartments);
router.post("/departments/add", AdminController.postAddDepartment);
router.post("/departments/update/:id", AdminController.postUpdateDepartment);
router.post("/departments/delete/:id", AdminController.postDeleteDepartment);

router.get("/sectors", AdminController.getSectors);
router.post("/sectors/add", AdminController.postAddSector);
router.post("/sectors/update/:id", AdminController.postUpdateSector);
router.post("/sectors/delete/:id", AdminController.postDeleteSector);

router.get("/companies", AdminController.getCompanies);
router.post("/companies/add", AdminController.postAddCompany);
router.post("/companies/update/:id", AdminController.postUpdateCompany);
router.post("/companies/delete/:id", AdminController.postDeleteCompany);

router.get("/students", AdminController.getStudents);
router.post("/students/evaluate/:id", AdminController.postEvaluateStudent);

router.get("/matching", AdminController.getMatching);
router.post("/matching/run", AdminController.postRunMatching);
router.post("/matching/add", AdminController.postAddManualMatch);
router.post("/matching/delete/:id", AdminController.postDeleteMatch);
router.post("/matching/finalize", AdminController.postFinalizeMatches);

router.get("/reports", AdminController.getReports);

module.exports = router;