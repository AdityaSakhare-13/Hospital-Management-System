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

    // 🔥 ADD (for clinical breakdown)
    type: {
      type: String,
      enum: ["Consultation", "Follow-up", "Emergency", "Routine"],
      default: "Consultation",
    },

    // 🔥 ADD (for urgent scheduling list)
    priority: {
      type: String,
      enum: ["Normal", "Urgent", "Emergency"],
      default: "Normal",
      index: true,
    },

    // 🔥 FIX (String → Date & indexed for bar graphs)
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },

    time: {
      type: String,
      required: [true, "Time is required"],
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Scheduled",
        "In Progress",
        "Confirmed",
        "Cancelled",
        "Completed",
      ],
      default: "Pending",
      index: true, // 🔥 ADD: filter fast
    },

    reason: {
      type: String,
      required: [true, "Reason for appointment is required"],
    },

    consultationMode: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offline",
    },

    meetingLink: {
      type: String,
      default: "",
    },

    doctorNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);