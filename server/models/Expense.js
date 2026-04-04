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
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    date: {
      type: String, // UI sends e.g., "2024-05-15"
      required: [true, "Date is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
