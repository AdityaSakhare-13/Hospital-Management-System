const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  // 📝 LOG ERRORS FOR DEBUGGING
  console.log("❌ Validation errors:", JSON.stringify(errors.array(), null, 2));

  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  throw new ApiError(422, "Validation failed", extractedErrors);
};

module.exports = validate;
