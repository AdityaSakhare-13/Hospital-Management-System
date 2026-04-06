const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  getAllUsers,
  getUserById,
  updateRole,
  toggleActive,
  deleteUser,
} = require("../controllers/authController");

router.use(protect)
router.use(authorize("admin"))

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id/role", updateRole);
router.put("/:id/toggle-active", toggleActive);
router.delete("/:id", deleteUser);

module.exports = router;