const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters"],
      index: true, // 🔥 ADD (search)
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      index: true, // 🔥 ADD (search fast)
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "doctor", "patient", "reception"],
      default: "patient",
      index: true, // 🔥 ADD (filter role-wise)
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },

    avatar: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true, // 🔥 ADD (active/inactive filter)
    },

    lastLogin: {
      type: Date,
      default: null,
      index: true,
    },

    // 🔥 ADD (profile section)
    address: {
      type: String,
      default: null,
    },

    // 🔥 ADD (for audit / security)
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // 🔥 Track password change
  this.passwordChangedAt = new Date();

  next();
});

// 🔥 Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);