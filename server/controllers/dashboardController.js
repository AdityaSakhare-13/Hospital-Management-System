const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");
const Billing = require("../models/Billing");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const totalPatients = await Patient.countDocuments();
  const totalDoctors = await Doctor.countDocuments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointmentsToday = await Appointment.countDocuments({
    appointmentDate: { $gte: today, $lt: tomorrow },
  });

  const totalRevenueData = await Billing.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = totalRevenueData[0]?.total || 0;

  const recentPatients = await Patient.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("name gender age status department");

  const onDutyDoctors = await Doctor.find({ isOnDuty: true })
    .limit(5)
    .select("name specialization shift rating");

  // Revenue by Dept (Pie Chart)
  const revenueByDept = await Billing.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: "$department", value: { $sum: "$amount" } } },
    { $project: { name: "$_id", value: 1, _id: 0 } }
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalPatients,
        totalDoctors,
        appointmentsToday,
        totalRevenue,
        recentPatients,
        onDutyDoctors,
        revenueByDept,
      },
      "Dashboard statistics fetched successfully"
    )
  );
});

// @desc    Global search for patients and doctors
// @route   GET /api/dashboard/search
exports.globalSearch = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(200).json(new ApiResponse(200, { patients: [], doctors: [] }, "Empty query"));
  }

  const regex = new RegExp(query, "i");

  const patients = await Patient.find({
    $or: [{ name: regex }, { contact: regex }, { email: regex }]
  }).limit(5).select("name status _id");

  const doctors = await Doctor.find({
    $or: [{ name: regex }, { specialization: regex }]
  }).limit(5).select("name specialization isOnDuty _id");

  return res.status(200).json(
    new ApiResponse(200, { patients, doctors }, "Global search results")
  );
});
