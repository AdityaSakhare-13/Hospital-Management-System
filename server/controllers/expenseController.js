const Expense = require("../models/Expense");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Create expense
// @route   POST /api/expenses
exports.createExpense = asyncHandler(async (req, res) => {
  const { item, category, amount, date } = req.body;

  const expense = await Expense.create({
    item,
    category,
    amount,
    date,
  });

  return res.status(201).json(
    new ApiResponse(201, expense, "Expense recorded successfully")
  );
});

// @desc    Get all expenses
// @route   GET /api/expenses
exports.getAllExpenses = asyncHandler(async (req, res) => {
  const { category } = req.query;

  let query = {};
  if (category) query.category = category;

  const expenses = await Expense.find(query).sort({ date: -1 });

  return res.status(200).json(
    new ApiResponse(200, expenses, "Expenses fetched successfully")
  );
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);

  if (!expense) {
    throw new ApiError(404, "Expense record not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Expense deleted successfully")
  );
});

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
exports.getExpenseStats = asyncHandler(async (req, res) => {
  const totalExpenses = await Expense.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const categoryBreakdown = await Expense.aggregate([
    { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } }
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      total: totalExpenses[0]?.total || 0,
      breakdown: categoryBreakdown
    }, "Expense stats fetched successfully")
  );
});
