const { body, param } = require("express-validator");

exports.uploadDocumentValidator = [
  body("patientId")
    .notEmpty().withMessage("Patient ID is required")
    .isMongoId().withMessage("Invalid Patient ID format"),
  body("fileType")
    .optional()
    .isIn(["report", "prescription", "lab_result", "discharge_summary", "imaging", "other"])
    .withMessage("Invalid file type"),
  body("description")
    .optional()
    .isString().withMessage("Description must be a string")
    .trim(),
];

exports.patientDocumentsValidator = [
  param("patientId")
    .isMongoId().withMessage("Invalid Patient ID format"),
];

exports.documentIdValidator = [
  param("id")
    .isMongoId().withMessage("Invalid Document ID format"),
];
