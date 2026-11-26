const express = require("express");
const router = express.Router();
const StudentController = require("../controllers/studentController");
const { isStudent } = require("../middleware/authMiddleware");

router.use(isStudent);

router.get("/profile", StudentController.getProfile);
router.post("/profile", StudentController.postProfile);
router.post("/cv", StudentController.postUploadCV);
router.get("/matches", StudentController.getMatches);

module.exports = router;