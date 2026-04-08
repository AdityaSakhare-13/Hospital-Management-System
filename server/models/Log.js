const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "BOOK_APPOINTMENT",
        "CANCEL_APPOINTMENT",
        "UPDATE_APPOINTMENT",
        "DOCTOR_LEAVE",
        "DOCTOR_EVENT",
        "UPLOAD_DOCUMENT",
        "DELETE_DOCUMENT",
        "USER_LOGIN",
        "USER_LOGOUT",
      ],
      required: [true, "Action type is required"],
      index: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Performer user ID is required"],
      index: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    targetModel: {
      type: String,
      enum: ["Appointment", "DoctorEvent", "Document", "User", null],
      default: null,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    details: {
      type: String,
      default: "",
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for filtering logs by action and date
logSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("Log", logSchema);
