const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: [true, "Item/Description is required"],
      trim: true,
    },

    category: {
      type: String,
      enum: ["Machine", "Equipment", "Furniture", "Other"],
      default: "Other",
      index: true, // 🔥 ADD (filter fast)
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    // 🔥 FIX (String → Date for graph & filter)
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true, // 🔥 ADD (dashboard graph fast)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);