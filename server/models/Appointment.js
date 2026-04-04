const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // 🔥 ADD (relation fields)
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },

    patient: {
      type: String,
      required: [true, "Patient name is required"],
    },

    doctor: {
      type: String,
      required: [true, "Doctor name is required"],
    },

    dept: {
      type: String,
      required: [true, "Department is required"],
    },

    // 🔥 FIX (String → Date)
    date: {
      type: Date,
      required: [true, "Date is required"],
    },

    time: {
      type: String,
      required: [true, "Time is required"],
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Cancelled",
        "Completed",
        "no-show",
        "rescheduled",
      ],
      default: "Pending",
    },

    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);