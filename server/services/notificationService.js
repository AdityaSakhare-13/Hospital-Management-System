const Notification = require("../models/Notification");
const User = require("../models/User");

/**
 * @desc   Create a notification for a specific user
 * @param  {ObjectId} userId - Target user's ID
 * @param  {String}   role - User's role
 * @param  {String}   message - Notification message
 * @param  {String}   type - Notification type (booking, cancellation, leave, document, system)
 * @param  {Object}   reference - Optional { id, model } for linking to related entity
 * @returns {Promise<Notification>}
 */
const notifyUser = async (userId, role, message, type, reference = {}) => {
  try {
    const notification = await Notification.create({
      userId,
      role,
      message,
      type,
      referenceId: reference.id || null,
      referenceModel: reference.model || null,
    });
    return notification;
  } catch (error) {
    console.error(`❌ Notification error (user ${userId}):`, error.message);
    // Fail silently – notifications should never block the main operation
    return null;
  }
};

/**
 * @desc   Notify ALL users who have one of the specified roles
 * @param  {String[]} roles - Array of roles to notify (e.g., ['admin', 'reception'])
 * @param  {String}   message - Notification message
 * @param  {String}   type - Notification type
 * @param  {Object}   reference - Optional { id, model }
 * @returns {Promise<Notification[]>}
 */
const notifyRoles = async (roles, message, type, reference = {}) => {
  try {
    const users = await User.find({ role: { $in: roles }, isActive: true }).select("_id role");

    if (!users.length) return [];

    const notifications = users.map((user) => ({
      userId: user._id,
      role: user.role,
      message,
      type,
      referenceId: reference.id || null,
      referenceModel: reference.model || null,
    }));

    const created = await Notification.insertMany(notifications);
    return created;
  } catch (error) {
    console.error(`❌ Bulk notification error (roles: ${roles.join(", ")}):`, error.message);
    return [];
  }
};

/**
 * @desc   Fetch notifications for a specific user (paginated)
 * @param  {ObjectId} userId
 * @param  {Object}   options - { page, limit, unreadOnly }
 * @returns {Promise<{ notifications, pagination }>}
 */
const getUserNotifications = async (userId, options = {}) => {
  const { page = 1, limit = 20, unreadOnly = false } = options;

  const query = { userId };
  if (unreadOnly) query.isRead = false;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Notification.countDocuments(query);

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return {
    notifications,
    pagination: {
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      limit: parseInt(limit),
    },
  };
};

/**
 * @desc   Mark a single notification as read
 * @param  {ObjectId} notificationId
 * @param  {ObjectId} userId - For ownership verification
 * @returns {Promise<Notification|null>}
 */
const markAsRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

/**
 * @desc   Mark all notifications as read for a user
 * @param  {ObjectId} userId
 * @returns {Promise<Object>}
 */
const markAllAsRead = async (userId) => {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

/**
 * @desc   Get unread count for a user
 * @param  {ObjectId} userId
 * @returns {Promise<Number>}
 */
const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, isRead: false });
};

module.exports = {
  notifyUser,
  notifyRoles,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
