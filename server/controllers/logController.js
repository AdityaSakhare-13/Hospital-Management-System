const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const logService = require("../services/logService");

// @desc    Get audit logs (admin only)
// @route   GET /api/logs
exports.getLogs = asyncHandler(async (req, res) => {
  const { action, performedBy, startDate, endDate, page = 1, limit = 50 } = req.query;

  const result = await logService.getLogs(
    { action, performedBy, startDate, endDate },
    { page, limit }
  );

  return res.status(200).json(
    new ApiResponse(200, result, "Audit logs fetched successfully")
  );
});
