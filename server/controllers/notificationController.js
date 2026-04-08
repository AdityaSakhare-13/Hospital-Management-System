const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const notificationService = require("../services/notificationService");

// @desc    Get current user's notifications
// @route   GET /api/notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;

  const result = await notificationService.getUserNotifications(req.user._id, {
    page,
    limit,
    unreadOnly: unreadOnly === "true",
  });

  return res.status(200).json(
    new ApiResponse(200, result, "Notifications fetched successfully")
  );
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);

  return res.status(200).json(
    new ApiResponse(200, { unreadCount: count }, "Unread count fetched successfully")
  );
});

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found or access denied");
  }

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
exports.markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);

  return res.status(200).json(
    new ApiResponse(200, { modifiedCount: result.modifiedCount }, "All notifications marked as read")
  );
});
