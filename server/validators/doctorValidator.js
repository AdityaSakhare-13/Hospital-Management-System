const { body, param } = require("express-validator");

exports.doctorValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Doctor name is required"),
  body("specialization")
    .notEmpty()
    .withMessage("Specialization is required"),
  body("experience")
    .notEmpty()
    .withMessage("Experience is required"),
  body("availability")
    .notEmpty()
    .withMessage("Availability is required"),
  body("contact")
    .notEmpty()
    .withMessage("Contact number is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email address"),
  body("status")
    .optional()
    .isIn(["Active", "On Leave", "Inactive"])
    .withMessage("Invalid status"),
  body("category")
    .optional()
    .isIn(["cardiology", "neurology", "orthopedic", "dermatology", "pediatric", "general"])
    .withMessage("Invalid category"),
  body("roleLevel")
    .optional()
    .isIn(["senior doctor", "junior doctor", "resident doctor", "consultant", "intern", "other"])
    .withMessage("Invalid role level"),
  body("shift")
    .optional()
    .isIn(["Morning", "Afternoon", "Night", "On Call"])
    .withMessage("Invalid shift"),
];

exports.doctorIdParamValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid doctor ID"),
];
