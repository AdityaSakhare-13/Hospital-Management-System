const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// All notification routes require authentication
router.use(protect);

// Get unread count (must be before /:id routes)
router.get("/unread-count", notificationController.getUnreadCount);

// Mark all as read (must be before /:id routes)
router.put("/read-all", notificationController.markAllAsRead);

// Get current user's notifications
router.get("/", notificationController.getNotifications);

// Mark single notification as read
router.put("/:id/read", notificationController.markAsRead);

module.exports = router;
