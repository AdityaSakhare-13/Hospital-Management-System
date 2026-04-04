const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect); // All expense routes require login

router.get("/stats", authorize("admin"), expenseController.getExpenseStats);

router
  .route("/")
  .post(authorize("admin"), expenseController.createExpense)
  .get(authorize("admin", "reception"), expenseController.getAllExpenses);

router
  .route("/:id")
  .delete(authorize("admin"), expenseController.deleteExpense);

module.exports = router;
