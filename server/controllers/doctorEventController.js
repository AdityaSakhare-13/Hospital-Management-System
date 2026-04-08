const DoctorEvent = require("../models/DoctorEvent");
const Doctor = require("../models/Doctor");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const logService = require("../services/logService");
const notificationService = require("../services/notificationService");

// @desc    Create doctor leave/event
// @route   POST /api/doctor-events
exports.createDoctorEvent = asyncHandler(async (req, res) => {
  const { doctorId, type, startDate, endDate, reason } = req.body;

  // Validate doctor exists
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    throw new ApiError(404, "Doctor not found");
  }

  // Validate date range
  if (new Date(startDate) > new Date(endDate)) {
    throw new ApiError(400, "Start date cannot be after end date");
  }

  // Check for overlapping events
  const overlap = await DoctorEvent.findOne({
    doctorId,
    status: { $in: ["pending", "approved"] },
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
    ],
  });

  if (overlap) {
    throw new ApiError(
      409,
      `Doctor already has a ${overlap.type} scheduled from ${overlap.startDate.toISOString().split("T")[0]} to ${overlap.endDate.toISOString().split("T")[0]}`
    );
  }

  const event = await DoctorEvent.create({
    doctorId,
    type,
    startDate,
    endDate,
    reason,
  });

  // If leave, optionally update doctor status
  if (type === "leave") {
    const today = new Date();
    if (new Date(startDate) <= today && new Date(endDate) >= today) {
      await Doctor.findByIdAndUpdate(doctorId, { status: "On Leave" });
    }
  }

  // Audit log
  const actionType = type === "leave" ? "DOCTOR_LEAVE" : "DOCTOR_EVENT";
  await logService.createLog({
    action: actionType,
    performedBy: req.user._id,
    targetModel: "DoctorEvent",
    targetId: event._id,
    details: `Dr. ${doctor.name} – ${type} from ${startDate} to ${endDate}: ${reason}`,
    ipAddress: req.ip,
  });

  // Notify reception staff
  await notificationService.notifyRoles(
    ["reception"],
    `Dr. ${doctor.name} has scheduled ${type} from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}. Reason: ${reason}`,
    "leave",
    { id: event._id, model: "DoctorEvent" }
  );

  // Also notify admin for leaves
  if (type === "leave") {
    await notificationService.notifyRoles(
      ["admin"],
      `Dr. ${doctor.name} has applied for leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      "leave",
      { id: event._id, model: "DoctorEvent" }
    );
  }

  return res.status(201).json(
    new ApiResponse(201, event, `Doctor ${type} created successfully`)
  );
});

// @desc    Get events for a specific doctor
// @route   GET /api/doctor-events/doctor/:doctorId
exports.getDoctorEvents = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;

  const query = { doctorId: req.params.doctorId };
  if (type) query.type = type;
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await DoctorEvent.countDocuments(query);

  const events = await DoctorEvent.find(query)
    .populate("doctorId", "name specialization")
    .populate("approvedBy", "fullName role")
    .sort({ startDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      events,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    }, "Doctor events fetched successfully")
  );
});

// @desc    Get all doctor events (admin view)
// @route   GET /api/doctor-events
exports.getAllDoctorEvents = asyncHandler(async (req, res) => {
  const { type, status, page = 1, limit = 50 } = req.query;

  const query = {};
  if (type) query.type = type;
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await DoctorEvent.countDocuments(query);

  const events = await DoctorEvent.find(query)
    .populate("doctorId", "name specialization")
    .populate("approvedBy", "fullName role")
    .sort({ startDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(200).json(
    new ApiResponse(200, {
      events,
      pagination: {
        total,
        pages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    }, "All doctor events fetched successfully")
  );
});

// @desc    Update event status (approve/reject)
// @route   PUT /api/doctor-events/:id/status
exports.updateEventStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["approved", "rejected", "cancelled"].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be: approved, rejected, or cancelled");
  }

  const event = await DoctorEvent.findById(req.params.id).populate("doctorId", "name");
  if (!event) {
    throw new ApiError(404, "Doctor event not found");
  }

  event.status = status;
  event.approvedBy = req.user._id;
  await event.save();

  // If approved leave that covers today, update doctor status
  if (status === "approved" && event.type === "leave") {
    const today = new Date();
    if (event.startDate <= today && event.endDate >= today) {
      await Doctor.findByIdAndUpdate(event.doctorId._id, { status: "On Leave" });
    }
  }

  // If rejected or cancelled, restore doctor status if needed
  if ((status === "rejected" || status === "cancelled") && event.type === "leave") {
    await Doctor.findByIdAndUpdate(event.doctorId._id, { status: "Active" });
  }

  return res.status(200).json(
    new ApiResponse(200, event, `Event ${status} successfully`)
  );
});

// @desc    Delete doctor event
// @route   DELETE /api/doctor-events/:id
exports.deleteDoctorEvent = asyncHandler(async (req, res) => {
  const event = await DoctorEvent.findByIdAndDelete(req.params.id);
  if (!event) {
    throw new ApiError(404, "Doctor event not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Doctor event deleted successfully")
  );
});
