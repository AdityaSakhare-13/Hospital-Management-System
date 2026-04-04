const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true // 🔥 ADD: fast search by user
    },

    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
      index: true, // 🔥 ADD: fast search by name
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other", "male", "female", "other"],
      required: [true, "Gender is required"],
    },

    contact: {
      type: String,
      required: [true, "Contact number is required"],
      index: true, // 🔥 ADD: fast search by phone
    },

    bloodGroup: {
      type: String,
      enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
      required: [true, "Blood group is required"],
    },

    status: {
      type: String,
      enum: ["Active", "Admitted", "Discharged"],
      default: "Active",
      index: true, // 🔥 ADD: Fast filter by status
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    medicalHistory: {
      type: String,
      default: "No known conditions",
    },

    // 🔥 ADD (Vitals Tracking)
    vitals: {
      bloodPressure: String, // e.g. "120/80"
      heartRate: Number,     // BPM
      temperature: Number,   // °F/°C
      oxygenSaturation: Number, // SpO2%
      height: Number,        // cm
      weight: Number,        // kg
      bmi: Number,
      lastUpdated: { type: Date, default: Date.now }
    },

    // 🔥 ADD (Medical Reports)
    medicalReports: [
      {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],

    admissionDate: {
      type: Date,
      default: Date.now,
      index: true // 🔥 ADD (dashboard)
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);