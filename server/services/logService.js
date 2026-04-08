const Log = require("../models/Log");

/**
 * @desc   Create an audit log entry
 * @param  {Object} logData
 * @param  {String} logData.action - Action type (BOOK_APPOINTMENT, CANCEL_APPOINTMENT, etc.)
 * @param  {ObjectId} logData.performedBy - User ID of the performer
 * @param  {ObjectId} [logData.appointmentId] - Related appointment ID (optional)
 * @param  {String} [logData.targetModel] - Target model name (optional)
 * @param  {ObjectId} [logData.targetId] - Target document ID (optional)
 * @param  {String} [logData.details] - Human-readable description
 * @param  {Object} [logData.metadata] - Arbitrary metadata object
 * @param  {String} [logData.ipAddress] - Request IP address
 * @returns {Promise<Log>}
 */
const createLog = async ({
  action,
  performedBy,
  appointmentId = null,
  targetModel = null,
  targetId = null,
  details = "",
  metadata = {},
  ipAddress = null,
}) => {
  try {
    const log = await Log.create({
      action,
      performedBy,
      appointmentId,
      targetModel,
      targetId,
      details,
      metadata,
      ipAddress,
    });
    return log;
  } catch (error) {
    console.error(`❌ Log creation error (${action}):`, error.message);
    // Fail silently – logging should never block the main operation
    return null;
  }
};

/**
 * @desc   Query logs with filters (paginated)
 * @param  {Object} filters - { action, performedBy, startDate, endDate }
 * @param  {Object} options - { page, limit }
 * @returns {Promise<{ logs, pagination }>}
 */
const getLogs = async (filters = {}, options = {}) => {
  const { action, performedBy, startDate, endDate } = filters;
  const { page = 1, limit = 50 } = options;

  const query = {};
  if (action) query.action = action;
  if (performedBy) query.performedBy = performedBy;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Log.countDocuments(query);

  const logs = await Log.find(query)
    .populate("performedBy", "fullName email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return {
    logs,
    pagination: {
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    },
  };
};

module.exports = {
  createLog,
  getLogs,
};
