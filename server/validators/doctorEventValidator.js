const { body, param } = require("express-validator");

exports.createDoctorEventValidator = [
  body("doctorId")
    .notEmpty().withMessage("Doctor ID is required")
    .isMongoId().withMessage("Invalid Doctor ID format"),
  body("type")
    .notEmpty().withMessage("Event type is required")
    .isIn(["leave", "event"]).withMessage("Type must be 'leave' or 'event'"),
  body("startDate")
    .notEmpty().withMessage("Start date is required")
    .isISO8601().withMessage("Start date must be a valid date"),
  body("endDate")
    .notEmpty().withMessage("End date is required")
    .isISO8601().withMessage("End date must be a valid date"),
  body("reason")
    .notEmpty().withMessage("Reason is required")
    .isString().withMessage("Reason must be a string")
    .trim()
    .isLength({ min: 3, max: 500 }).withMessage("Reason must be between 3 and 500 characters"),
];

exports.doctorEventIdValidator = [
  param("id")
    .isMongoId().withMessage("Invalid Event ID format"),
];

exports.doctorIdParamValidator = [
  param("doctorId")
    .isMongoId().withMessage("Invalid Doctor ID format"),
];

exports.updateEventStatusValidator = [
  param("id")
    .isMongoId().withMessage("Invalid Event ID format"),
  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["approved", "rejected", "cancelled"]).withMessage("Status must be: approved, rejected, or cancelled"),
];
