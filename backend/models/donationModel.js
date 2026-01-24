const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cause: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cause",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Card", "Bank Transfer"],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success"],
      default: "success",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
