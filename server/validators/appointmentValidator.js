const { body, param } = require("express-validator");

exports.appointmentValidator = [
  body("patient")
    .notEmpty()
    .withMessage("Patient name is required"),
  body("doctor")
    .notEmpty()
    .withMessage("Doctor name is required"),
  body("date")
    .notEmpty()
    .withMessage("Appointment date is required"),
  body("time")
    .notEmpty()
    .withMessage("Appointment time is required"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason for appointment is required")
    .isLength({ min: 2 })
    .withMessage("Reason must be at least 2 characters"),
  body("consultationMode")
    .optional()
    .isIn(["Online", "Offline"])
    .withMessage("Invalid consultation mode"),
  body("meetingLink")
    .optional()
    .if(body("consultationMode").equals("Online"))
    .notEmpty()
    .withMessage("Meeting link is required for Online consultation")
    .isURL()
    .withMessage("Valid meeting link is required for Online consultation"),
  body("doctorNotes")
    .optional()
    .trim(),
];

exports.appointmentUpdateValidator = [
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Invalid appointment date format"),
  body("time")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (use HH:MM)"),
  body("status")
    .optional()
    .isIn([
      "Pending",
      "Scheduled",
      "In Progress",
      "Confirmed",
      "Cancelled",
      "Completed",
    ])
    .withMessage("Invalid status"),
  body("reason")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Reason must be at least 5 characters"),
  body("consultationMode")
    .optional()
    .isIn(["Online", "Offline"])
    .withMessage("Invalid consultation mode"),
  body("meetingLink")
    .optional()
    .if(body("consultationMode").equals("Online"))
    .notEmpty()
    .withMessage("Meeting link is required for Online consultation")
    .isURL()
    .withMessage("Valid meeting link is required for Online consultation"),
  body("doctorNotes")
    .optional()
    .trim(),
  body("notes")
    .optional()
    .trim(),
];

exports.appointmentIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid appointment ID"),
];

exports.patientIdParamValidator = [
  param("patientId")
    .isMongoId()
    .withMessage("Invalid patient ID"),
];

exports.doctorIdParamValidator = [
  param("doctorId")
    .isMongoId()
    .withMessage("Invalid doctor ID"),
];
