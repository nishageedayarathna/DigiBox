const mongoose = require("mongoose");

const causeSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: [10, "Title must be at least 10 characters"],
      maxlength: [100, "Title must be less than 100 characters"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [30, "Description must be at least 30 characters"],
      maxlength: [500, "Description must be less than 500 characters"],
      trim: true,
    },

    requiredAmount: {
      type: Number,
      required: [true, "Required amount is required"],
      min: [1000, "Minimum amount is LKR 1,000"],
      max: [5000000, "Maximum amount is LKR 5,000,000"],
    },

    collectedAmount: { type: Number, default: 0 },

    beneficiaryName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },

    beneficiaryContact: {
      type: String,
      required: true,
      match: [/^07\d{8}$/, "Invalid Sri Lankan mobile number"],
    },

    beneficiaryAccountName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
    },

    beneficiaryBank: {
      type: String,
      required: true,
      minlength: 3,
    },

    beneficiaryAccountNumber: {
      type: String,
      required: true,
      match: [/^\d{6,20}$/, "Account number must be 6–20 digits"],
    },

    beneficiaryBranch: {
      type: String,
      required: true,
      minlength: 2,
    },

    evidenceFile: { type: String, required: true },

    evidenceFileType: {
      type: String,
      enum: ["image", "pdf"],
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cause", causeSchema);
