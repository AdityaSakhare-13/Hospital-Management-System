const mongoose = require("mongoose");

const doctorEventSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
      index: true,
    },

    type: {
      type: String,
      enum: ["leave", "event"],
      required: [true, "Event type is required"],
      index: true,
    },

    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      index: true,
    },

    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },

    reason: {
      type: String,
      required: [true, "Reason is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for checking schedule conflicts
doctorEventSchema.index({ doctorId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("DoctorEvent", doctorEventSchema);
