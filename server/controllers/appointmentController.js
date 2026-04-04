const Appointment = require("../models/Appointment");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @desc    Create appointment
// @route   POST /api/appointments
exports.createAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, dept, date, time, reason, status } = req.body;

  const appointment = await Appointment.create({
    patient,
    doctor,
    dept,
    date,
    time,
    reason,
    status: status || "Pending",
  });

  return res.status(201).json(
    new ApiResponse(201, appointment, "Appointment scheduled successfully")
  );
});

// @desc    Get all appointments
// @route   GET /api/appointments
exports.getAllAppointments = asyncHandler(async (req, res) => {
  const { search, status, date } = req.query;

  let query = {};
  if (search) {
    query.$or = [
      { patient: { $regex: search, $options: "i" } },
      { doctor: { $regex: search, $options: "i" } },
    ];
  }

  if (status) query.status = status;
  if (date) query.date = date;

  const appointments = await Appointment.find(query).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, appointments, "Appointments fetched successfully")
  );
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, appointment, "Appointment fetched successfully")
  );
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
exports.updateAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, dept, date, time, status, reason } = req.body;

  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  // Update fields
  if (patient) appointment.patient = patient;
  if (doctor) appointment.doctor = doctor;
  if (dept) appointment.dept = dept;
  if (date) appointment.date = date;
  if (time) appointment.time = time;
  if (status) appointment.status = status;
  if (reason) appointment.reason = reason;

  appointment = await appointment.save();

  return res.status(200).json(
    new ApiResponse(200, appointment, "Appointment updated successfully")
  );
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
exports.deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);

  if (!appointment) {
    throw new ApiError(404, "Appointment not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Appointment deleted successfully")
  );
});
