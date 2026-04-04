const { body } = require("express-validator");

exports.doctorValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Doctor name is required"),

  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),

  body("qualification")
    .optional({ checkFalsy: true })
    .trim(),

  body("experience")
    .optional({ checkFalsy: true })
    .trim(),

  body("contact")
    .trim()
    .notEmpty()
    .withMessage("Contact number is required"),

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email format"),

  body("fees")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Fees must be a number"),

  body("status")
    .optional({ checkFalsy: true })
    .isIn(["Active", "On Leave", "Inactive"])
    .withMessage("Status must be one of: Active, On Leave, Inactive"),
];
