const mongoose = require("mongoose");

// Queue model — used by Reception Queue Management UI
const queueSchema = new mongoose.Schema(
  {
    // Token number in queue (auto-incremented by app logic)
    token: {
      type: Number,
      required: true,
      index: true, // 🔥 ADD (fast sorting)
    },

    // Patient reference (optional — can be a walk-in)
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
      index: true, // 🔥 ADD
    },

    // Plain name for walk-in / unregistered patients
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      index: true, // 🔥 ADD (search bar)
    },

    // Assigned doctor
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
      index: true, // 🔥 ADD
    },

    doctorName: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
      index: true, // 🔥 ADD (filter)
    },

    // Status as shown in Reception UI
    status: {
      type: String,
      enum: ["Waiting", "In Progress", "Done", "Skipped"],
      default: "Waiting",
      index: true, // 🔥 ADD (filter fast)
    },

    // 🔥 ADD (priority queue support)
    priority: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
    },

    // When they joined the queue
    joinedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // When their session started
    calledAt: {
      type: Date,
      default: null,
    },

    // 🔥 ADD (when completed)
    completedAt: {
      type: Date,
      default: null,
    },

    // Appointment reference if they have one
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    // Date this queue entry is for (defaults to today)
    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
      index: true, // 🔥 ADD (dashboard filter)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Queue", queueSchema);