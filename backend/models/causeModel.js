//causeModel.js
const mongoose = require("mongoose");

const causeSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: String,
    description: String,
    requiredAmount: Number,

    beneficiaryName: String,
    beneficiaryContact: String,
    beneficiaryAccountName: String,
    beneficiaryBank: String,
    beneficiaryAccountNumber: String,
    beneficiaryBranch: String,

    evidenceFile: String,
    evidenceFileType: String,

    districtCode: String,
    districtName: String,
    divisionCode: String,
    divisionName: String,
    areaCode: String,
    areaName: String,

    gsOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dsOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Approval flow
    adminStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    gsStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    dsStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    finalStatus: { type: String, default: "pending" },
    fundsRaised: { type: Number, default: 0 },

    // 🔥 GS Verification fields
    gsVerification: {
      remarks: String,
      recommendation: String,
      date: Date,
      signature: String, // can be image url or text
    },
    gsDocument: String, // PDF file path or URL

    rejectionReason: String // reason if GS rejected
  },
  { timestamps: true }
);



module.exports = mongoose.model("Cause", causeSchema);
