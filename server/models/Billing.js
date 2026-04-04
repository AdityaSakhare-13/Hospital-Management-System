const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema(
  {
    // 🔥 Patient relation
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
      index: true, // 🔥 ADD (fast query)
    },

    // Plain text patient name (UI support)
    patientName: {
      type: String,
      trim: true,
    },

    // 🔥 Doctor relation
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
      index: true, // 🔥 ADD
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    type: {
      type: String,
      enum: ["OPD", "IPD", "Lab", "Pharmacy"],
      default: "OPD",
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Overdue"],
      default: "Pending",
      index: true, // 🔥 ADD (filter fast)
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "other"],
      default: undefined,
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    date: {
      type: Date,
      default: Date.now,
      index: true, // 🔥 ADD (dashboard graph fast)
    },

    // 🔥 ADD (department-wise revenue graph)
    department: {
      type: String,
      enum: [
        "cardiology",
        "neurology",
        "orthopedic",
        "dermatology",
        "pediatric",
        "general",
        "other",
      ],
      default: "other",
    },

    // 🔥 ADD (expense/bill category tracking)
    category: {
      type: String,
      enum: ["consultation", "test", "medicine", "surgery", "other"],
      default: "consultation",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Billing", billingSchema);