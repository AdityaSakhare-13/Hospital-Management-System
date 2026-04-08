const express = require("express");
const router = express.Router();
const logController = require("../controllers/logController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Admin only – view audit logs
router.get("/", protect, authorize("admin"), logController.getLogs);

module.exports = router;
