const Billing = require("../models/Billing");
const Expense = require("../models/Expense");
const Patient = require("../models/Patient");
const Medicine = require("../models/Medicine");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

// Helper: short month name from month number (1-12)
const MONTH_NAMES = [
  "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// Helper: Build date filter for a given field
const buildDateFilter = (startDate, endDate, field = "date") => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      throw new ApiError(400, "Invalid date format. Use YYYY-MM-DD.");
    }
    end.setHours(23, 59, 59, 999); // include full end day
    return { [field]: { $gte: start, $lte: end } };
  }
  // Default: last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return { [field]: { $gte: thirtyDaysAgo } };
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    GET Financial Summary (Revenue vs Expenses)
// @route   GET /api/reports/financial?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getFinancialSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const billingFilter = buildDateFilter(startDate, endDate, "date");
  const expenseFilter = buildDateFilter(startDate, endDate, "date");

  // ── Revenue aggregation (only Paid bills) ──────────────────────────────
  const [revenueResult] = await Billing.aggregate([
    { $match: { ...billingFilter, $or: [{ paymentStatus: "Paid" }, { status: "Paid" }] } },
    { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
  ]);

  // ── All billing (pending + paid) for total billed ─────────────────────
  const [billedResult] = await Billing.aggregate([
    { $match: billingFilter },
    { $group: { _id: null, totalBilled: { $sum: "$amount" } } },
  ]);

  // ── Expense aggregation ────────────────────────────────────────────────
  const [expenseResult] = await Expense.aggregate([
    { $match: expenseFilter },
    { $group: { _id: null, totalExpenses: { $sum: "$amount" } } },
  ]);

  const totalRevenue = revenueResult?.totalRevenue || 0;
  const totalBilled = billedResult?.totalBilled || 0;
  const totalExpenses = expenseResult?.totalExpenses || 0;
  const netProfit = totalRevenue - totalExpenses;

  // ── Revenue by bill type (OPD / IPD / Lab / Pharmacy) ────────────────
  const revenueByType = await Billing.aggregate([
    { $match: { ...billingFilter, $or: [{ paymentStatus: "Paid" }, { status: "Paid" }] } },
    { $group: { _id: "$type", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  // ── Revenue by department ─────────────────────────────────────────────
  const revenueByDepartment = await Billing.aggregate([
    { $match: { ...billingFilter, $or: [{ paymentStatus: "Paid" }, { status: "Paid" }] } },
    { $group: { _id: "$department", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
  ]);

  // ── Monthly revenue chart ─────────────────────────────────────────────
  const monthlyRevenue = await Billing.aggregate([
    { $match: { ...billingFilter, $or: [{ paymentStatus: "Paid" }, { status: "Paid" }] } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        revenue: 1,
      },
    },
  ]);

  // Manually add month names after aggregation
  const monthlyRevenueFormatted = monthlyRevenue.map(item => ({
    ...item,
    monthName: MONTH_NAMES[item.month] || `Month ${item.month}`
  }));

  // ── Monthly expenses chart ────────────────────────────────────────────
  const monthlyExpenses = await Expense.aggregate([
    { $match: expenseFilter },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        expenses: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        expenses: 1,
      },
    },
  ]);

  const monthlyExpensesFormatted = monthlyExpenses.map(item => ({
    ...item,
    monthName: MONTH_NAMES[item.month] || `Month ${item.month}`
  }));

  // ── Expense by category breakdown ─────────────────────────────────────
  const expenseByCategory = await Expense.aggregate([
    { $match: expenseFilter },
    { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  // ── Payment method distribution ───────────────────────────────────────
  const paymentMethodBreakdown = await Billing.aggregate([
    { $match: { ...billingFilter, $or: [{ paymentStatus: "Paid" }, { status: "Paid" }] } },
    { $group: { _id: "$paymentMethod", total: { $sum: "$amount" }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalRevenue,
          totalBilled,
          totalExpenses,
          netProfit,
          profitMargin: totalRevenue > 0
            ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(2))
            : 0,
        },
        charts: {
          monthlyRevenue: monthlyRevenueFormatted,
          monthlyExpenses: monthlyExpensesFormatted,
          revenueByType,
          revenueByDepartment,
          expenseByCategory,
          paymentMethodBreakdown,
        },
      },
      "Financial summary fetched successfully"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    GET Patient Demographics
// @route   GET /api/reports/patients
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getPatientDemographics = asyncHandler(async (req, res) => {
  const totalPatients = await Patient.countDocuments();
  const activePatients = await Patient.countDocuments({ status: "Active" });
  const admittedPatients = await Patient.countDocuments({ status: "Admitted" });
  const dischargedPatients = await Patient.countDocuments({ status: "Discharged" });

  // ── Status distribution ───────────────────────────────────────────────
  const statusDistribution = await Patient.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // ── Gender distribution ───────────────────────────────────────────────
  // Normalise case differences (Male/male → Male)
  const genderDistribution = await Patient.aggregate([
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $regexMatch: { input: "$gender", regex: /^male$/i } }, then: "Male" },
              { case: { $regexMatch: { input: "$gender", regex: /^female$/i } }, then: "Female" },
            ],
            default: "Other",
          },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // ── Department distribution ───────────────────────────────────────────
  const departmentDistribution = await Patient.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // ── Blood group distribution ──────────────────────────────────────────
  const bloodGroupDistribution = await Patient.aggregate([
    { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // ── Age buckets (0-17, 18-34, 35-49, 50-64, 65+) ─────────────────────
  const ageGroups = await Patient.aggregate([
    {
      $bucket: {
        groupBy: "$age",
        boundaries: [0, 18, 35, 50, 65, 200],
        default: "Unknown",
        output: { count: { $sum: 1 } },
      },
    },
    {
      $project: {
        _id: 0,
        range: {
          $switch: {
            branches: [
              { case: { $eq: ["$_id", 0] }, then: "0-17" },
              { case: { $eq: ["$_id", 18] }, then: "18-34" },
              { case: { $eq: ["$_id", 35] }, then: "35-49" },
              { case: { $eq: ["$_id", 50] }, then: "50-64" },
              { case: { $eq: ["$_id", 65] }, then: "65+" },
            ],
            default: "Unknown",
          },
        },
        count: 1,
      },
    },
  ]);

  // ── New patients per month (last 6 months) ────────────────────────────
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const newPatientsTrend = await Patient.aggregate([
    { $match: { admissionDate: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$admissionDate" }, month: { $month: "$admissionDate" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        count: 1,
      },
    },
  ]);

  const newPatientsTrendFormatted = newPatientsTrend.map(item => ({
    ...item,
    monthName: MONTH_NAMES[item.month] || `Month ${item.month}`
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalPatients,
          activePatients,
          admittedPatients,
          dischargedPatients,
        },
        statusDistribution,
        genderDistribution,
        departmentDistribution,
        bloodGroupDistribution,
        ageGroups,
        newPatientsTrend: newPatientsTrendFormatted,
      },
      "Patient demographics fetched successfully"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    GET Inventory Status
// @route   GET /api/reports/inventory
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getInventoryStatus = asyncHandler(async (req, res) => {
  const totalMedicines = await Medicine.countDocuments();
  const availableCount = await Medicine.countDocuments({ status: "available" });
  const outOfStockCount = await Medicine.countDocuments({ status: "out_of_stock" });

  // Low stock: quantity <= minStock (use each medicine's own minStock field)
  const lowStockCount = await Medicine.countDocuments({
    $expr: { $lte: ["$quantity", "$minStock"] },
    status: "available",
  });

  // Total inventory value
  const [valueResult] = await Medicine.aggregate([
    { $group: { _id: null, totalValue: { $sum: { $multiply: ["$quantity", "$price"] } } } },
  ]);

  // ── Category distribution ─────────────────────────────────────────────
  const categoryDistribution = await Medicine.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 }, totalQty: { $sum: "$quantity" } } },
    { $sort: { count: -1 } },
  ]);

  // ── Low stock items (quantity <= minStock) ────────────────────────────
  const lowStockItems = await Medicine.find({
    $expr: { $lte: ["$quantity", "$minStock"] },
  })
    .select("name quantity minStock category price expiryDate supplier status")
    .sort({ quantity: 1 })
    .limit(20);

  // ── Expiring soon (within 90 days) ───────────────────────────────────
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

  const expiringSoon = await Medicine.find({
    expiryDate: { $lte: ninetyDaysFromNow, $gte: new Date() },
  })
    .select("name expiryDate quantity category")
    .sort({ expiryDate: 1 })
    .limit(10);

  // ── Expired medicines ─────────────────────────────────────────────────
  const expiredCount = await Medicine.countDocuments({
    expiryDate: { $lt: new Date() },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        summary: {
          totalMedicines,
          availableCount,
          outOfStockCount,
          lowStockCount,
          expiredCount,
          totalInventoryValue: valueResult?.totalValue || 0,
        },
        categoryDistribution,
        lowStockItems,
        expiringSoon,
      },
      "Inventory status fetched successfully"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    GET Doctor Performance
// @route   GET /api/reports/doctors
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getDoctorPerformance = asyncHandler(async (req, res) => {
  // ── Appointment-based performance per doctor ──────────────────────────
  const performance = await Appointment.aggregate([
    {
      $group: {
        _id: "$doctorId",
        totalAppointments: { $sum: 1 },
        completedAppointments: {
          $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] },
        },
        cancelledAppointments: {
          $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] },
        },
        pendingAppointments: {
          $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
        },
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctorInfo",
      },
    },
    { $unwind: { path: "$doctorInfo", preserveNullAndEmpty: false } },
    {
      $project: {
        _id: 1,
        name: "$doctorInfo.name",
        specialization: "$doctorInfo.specialization",
        category: "$doctorInfo.category",
        department: "$doctorInfo.category",   // alias for frontend
        roleLevel: "$doctorInfo.roleLevel",
        shift: "$doctorInfo.shift",
        status: "$doctorInfo.status",
        rating: "$doctorInfo.rating",
        isOnDuty: "$doctorInfo.isOnDuty",
        totalAppointments: 1,
        completedAppointments: 1,
        cancelledAppointments: 1,
        pendingAppointments: 1,
        completionRate: {
          $cond: [
            { $gt: ["$totalAppointments", 0] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$completedAppointments", "$totalAppointments"] },
                    100,
                  ],
                },
                1,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { totalAppointments: -1 } },
  ]);

  // ── Doctors with NO appointments (registered but not yet active) ──────
  const busyDoctorIds = performance.map((p) => p._id);
  const inactiveDoctors = await Doctor.find(
    { _id: { $nin: busyDoctorIds } },
    "name specialization category status shift rating"
  );

  // ── Department-wise appointment count ─────────────────────────────────
  const departmentAppointments = await Appointment.aggregate([
    { $group: { _id: "$dept", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // ── Appointments by status ─────────────────────────────────────────────
  const appointmentStatusSummary = await Appointment.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // ── Monthly appointment trend (last 6 months) ─────────────────────────
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTrend = await Appointment.aggregate([
    { $match: { date: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] } },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        count: 1,
        completed: 1,
      },
    },
  ]);

  const monthlyTrendFormatted = monthlyTrend.map(item => ({
    ...item,
    monthName: MONTH_NAMES[item.month] || `Month ${item.month}`
  }));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        performance,
        inactiveDoctors,
        charts: {
          departmentAppointments,
          appointmentStatusSummary,
          monthlyTrend: monthlyTrendFormatted,
        },
      },
      "Doctor performance fetched successfully"
    )
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    GET Overview / Dashboard Widgets Summary
// @route   GET /api/reports/overview
// @access  Private / Admin
// ─────────────────────────────────────────────────────────────────────────────
exports.getOverview = asyncHandler(async (req, res) => {
  const now = new Date();

  // This month's window
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Run all counts in parallel
  const [
    totalPatients,
    newPatientsThisMonth,
    totalDoctors,
    activeDoctors,
    totalAppointments,
    appointmentsToday,
    totalMedicines,
    lowStockMedicines,
    revenueResult,
    expenseResult,
  ] = await Promise.all([
    Patient.countDocuments(),
    Patient.countDocuments({ admissionDate: { $gte: startOfMonth } }),
    Doctor.countDocuments(),
    Doctor.countDocuments({ status: "Active" }),
    Appointment.countDocuments(),
    Appointment.countDocuments({
      date: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
      },
    }),
    Medicine.countDocuments(),
    Medicine.countDocuments({ $expr: { $lte: ["$quantity", "$minStock"] } }),
    Billing.aggregate([
      { $match: { date: { $gte: startOfMonth }, $or: [{ paymentStatus: "Paid" }, { status: "Paid" }] } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
  ]);

  const revenueThisMonth = revenueResult[0]?.total || 0;
  const expensesThisMonth = expenseResult[0]?.total || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        patients: {
          total: totalPatients,
          newThisMonth: newPatientsThisMonth,
        },
        doctors: {
          total: totalDoctors,
          active: activeDoctors,
        },
        appointments: {
          total: totalAppointments,
          today: appointmentsToday,
        },
        inventory: {
          total: totalMedicines,
          lowStock: lowStockMedicines,
        },
        finance: {
          revenueThisMonth,
          expensesThisMonth,
          netProfitThisMonth: revenueThisMonth - expensesThisMonth,
        },
      },
      "Overview summary fetched successfully"
    )
  );
});
