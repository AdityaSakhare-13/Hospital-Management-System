const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateRole,
  toggleActive,
  updateStatus,        // ✅ IMPORTANT (ये add किया)
} = require("../controllers/authController");

// ================= ROUTES =================

// 👉 Get all users
router.get("/users", getAllUsers);

// 👉 Get user by ID
router.get("/users/:id", getUserById);

// 👉 Update user role
router.put("/users/:id/role", updateRole);

// 👉 Toggle active / inactive
router.put("/users/:id/toggle-active", toggleActive);

// 👉 Update status (active / inactive)
router.patch("/users/:id/status", updateStatus);

module.exports = router;