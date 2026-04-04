const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // 🔥 ADD (search fast)
    },

    category: {
      type: String, // Tablet, Syrup, Injection
      enum: ["tablet", "syrup", "injection", "capsule", "other"],
      default: "other",
      index: true, // 🔥 ADD (filter fast)
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
    },

    expiryDate: {
      type: Date,
      index: true, // 🔥 ADD (expiry tracking)
    },

    supplier: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["available", "out_of_stock"],
      default: "available",
      index: true,
    },

    // 🔥 ADD (auto stock status control)
    minStock: {
      type: Number,
      default: 10,
    },

    // 🔥 ADD (low stock alert)
    isLowStock: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);