const fs = require("fs");
const path = require("path");
const StudentModel = require("../models/studentModel");
const uploadCV = require("../middleware/uploadMiddleware");

const APPLICATION_DEADLINE = new Date("2026-12-14T08:30:00");

const StudentController = {
  getProfile: async (req, res) => {
    const studentId = req.session.user.id;
    const student = await StudentModel.getStudentById(studentId);
    const sectors = await StudentModel.getAllSectors();
    const selectedSectors = await StudentModel.getStudentSectorIds(studentId);

    res.render("student/profile", {
      student,
      sectors,
      selectedSectors,
      error: null,
      success: null,
      formData: {
        cgpa: student.cgpa,
        interview_language: student.interview_language,
        sectors: selectedSectors.map(String),
      },
    });
  },

  postProfile: async (req, res) => {
    const studentId = req.session.user.id;
    const { cgpa, interview_language } = req.body;
    let sectorsInput = req.body.sectors || [];
    if (!Array.isArray(sectorsInput)) {
      sectorsInput = [sectorsInput];
    }

    const student = await StudentModel.getStudentById(studentId);
    const allSectors = await StudentModel.getAllSectors();
    const parsedCgpa = parseFloat(cgpa);

    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 4.0) {
      return res.render("student/profile", {
        student,
        sectors: allSectors,
        selectedSectors: sectorsInput.map(Number),
        error: "CGPA must be between 0.00 and 4.00.",
        success: null,
        formData: { cgpa, interview_language, sectors: sectorsInput },
      });
    }

    if (!interview_language || !interview_language.trim()) {
      return res.render("student/profile", {
        student,
        sectors: allSectors,
        selectedSectors: sectorsInput.map(Number),
        error: "Interview language is required.",
        success: null,
        formData: { cgpa, interview_language, sectors: sectorsInput },
      });
    }

    if (sectorsInput.length === 0 || sectorsInput.length > 5) {
      return res.render("student/profile", {
        student,
        sectors: allSectors,
        selectedSectors: sectorsInput.map(Number),
        error: "Please select between 1 and 5 preferred sectors.",
        success: null,
        formData: { cgpa, interview_language, sectors: sectorsInput },
      });
    }

    try {
      await StudentModel.updateStudentProfile(studentId, {
        cgpa: parsedCgpa.toFixed(2),
        interview_language: interview_language.trim(),
        sectorIds: sectorsInput.map(Number),
      });

      const updatedStudent = await StudentModel.getStudentById(studentId);
      const updatedSectorIds = await StudentModel.getStudentSectorIds(studentId);

      res.render("student/profile", {
        student: updatedStudent,
        sectors: allSectors,
        selectedSectors: updatedSectorIds,
        error: null,
        success: "Profile updated successfully.",
        formData: {
          cgpa: updatedStudent.cgpa,
          interview_language: updatedStudent.interview_language,
          sectors: updatedSectorIds.map(String),
        },
      });
    } catch (err) {
      console.error(err);
      res.render("student/profile", {
        student,
        sectors: allSectors,
        selectedSectors: sectorsInput.map(Number),
        error: "Failed to update profile.",
        success: null,
        formData: { cgpa, interview_language, sectors: sectorsInput },
      });
    }
  },

  postUploadCV: (req, res) => {
    const uploadSingle = uploadCV.single("cv");

    uploadSingle(req, res, async (err) => {
      const studentId = req.session.user.id;
      const student = await StudentModel.getStudentById(studentId);
      const sectors = await StudentModel.getAllSectors();
      const selectedSectors = await StudentModel.getStudentSectorIds(studentId);

      const renderWithMsg = (errorMsg, successMsg) => {
        res.render("student/profile", {
          student,
          sectors,
          selectedSectors,
          error: errorMsg,
          success: successMsg,
          formData: {
            cgpa: student.cgpa,
            interview_language: student.interview_language,
            sectors: selectedSectors.map(String),
          },
        });
      };

      if (new Date() > APPLICATION_DEADLINE) {
        if (req.file) fs.unlinkSync(req.file.path);
        return renderWithMsg("The application deadline has passed. CV cannot be modified.", null);
      }

      if (err) {
        return renderWithMsg(err.message || "Invalid file upload.", null);
      }

      if (!req.file) {
        return renderWithMsg("Please select a PDF file to upload.", null);
      }

      try {
        if (student.cv_path) {
          const oldPath = path.join(__dirname, "../public", student.cv_path);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }

        const relativePath = `/uploads/cvs/${req.file.filename}`;
        await StudentModel.updateStudentCV(studentId, relativePath);
        student.cv_path = relativePath;

        renderWithMsg(null, "CV uploaded successfully.");
      } catch (dbErr) {
        console.error(dbErr);
        renderWithMsg("Error saving CV record.", null);
      }
    });
  },

  getMatches: async (req, res) => {
    const studentId = req.session.user.id;
    const matches = await StudentModel.getFinalizedMatches(studentId);
    res.render("student/matches", { matches });
  },
};

module.exports = StudentController;