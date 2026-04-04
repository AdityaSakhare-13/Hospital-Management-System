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
    },

    address: {
      type: String,
      required: [true, "Address is required"],
    },

    medicalHistory: {
      type: String,
      default: "No known conditions",
    },

    height: {
      type: Number,
      default: 0,
    },

    weight: {
      type: Number,
      default: 0,
    },

    admissionDate: {
      type: Date,
      default: null // 🔥 ADD (dashboard + patient details ke liye useful)
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);