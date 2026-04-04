const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true, // 🔥 ADD (fast queries)
    },

    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
    },

    // 🔥 ADD (for category filter in UI)
    category: {
      type: String,
      enum: [
        "cardiology",
        "neurology",
        "orthopedic",
        "dermatology",
        "pediatric",
        "general",
      ],
      default: "general",
    },

    experience: {
      type: String, // keep same (UI sends "12 Years")
      required: [true, "Experience is required"],
    },

    availability: {
      type: String,
      required: [true, "Availability is required"],
    },

    contact: {
      type: String,
      required: [true, "Contact number is required"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
      index: true, // 🔥 ADD (filter fast)
    },

    // 🔥 ADD (role management)
    roleLevel: {
      type: String,
      enum: [
        "senior doctor",
        "junior doctor",
        "resident doctor",
        "consultant",
        "intern",
        "other",
      ],
      default: "other",
    },

    // 🔥 ADD (on-duty doctor list)
    isOnDuty: {
      type: Boolean,
      default: false,
    },

    // existing
    patients: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);