const express = require("express");
const router = express.Router();
const {
  getFinancialSummary,
  getPatientDemographics,
  getInventoryStatus,
  getDoctorPerformance,
  getOverview,
} = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All report routes require authentication and admin access
router.use(protect);
router.use(authorize("admin")); // Only 'admin' role exists in User model

// ── Report Endpoints ────────────────────────────────────────────────────────
// GET /api/reports/overview    → Combined KPI widgets (patients, doctors, finance)
// GET /api/reports/financial   → Revenue vs Expenses (supports ?startDate&endDate)
// GET /api/reports/patients    → Patient demographics (status, gender, age, dept)
// GET /api/reports/inventory   → Medicine stock status (low stock, expiring, expired)
// GET /api/reports/doctors     → Doctor appointment performance & trends

router.get("/overview", getOverview);
router.get("/financial", getFinancialSummary);
router.get("/patients", getPatientDemographics);
router.get("/inventory", getInventoryStatus);
router.get("/doctors", getDoctorPerformance);

module.exports = router;
