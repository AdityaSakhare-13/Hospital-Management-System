const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { upload } = require("../services/uploadService");
const {
  uploadDocumentValidator,
  patientDocumentsValidator,
  documentIdValidator,
} = require("../validators/documentValidator");
const validate = require("../middleware/validatorMiddleware");
const { protect, authorize } = require("../middleware/authMiddleware");

// Upload document (single file, field name = "document")
router.post(
  "/upload",
  protect,
  authorize("admin", "doctor", "reception"),
  upload.single("document"),
  uploadDocumentValidator,
  validate,
  documentController.uploadDocument
);

// Get patient documents
router.get(
  "/patient/:patientId",
  protect,
  patientDocumentsValidator,
  validate,
  documentController.getPatientDocuments
);

// Get / Delete single document
router
  .route("/:id")
  .get(protect, documentIdValidator, validate, documentController.getDocumentById)
  .delete(
    protect,
    authorize("admin", "doctor"),
    documentIdValidator,
    validate,
    documentController.deleteDocument
  );

module.exports = router;
