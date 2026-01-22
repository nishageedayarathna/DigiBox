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
    adminStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    gsStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    dsStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    finalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

    gsVerification: { remarks: String, date: Date, signature: String },
    gsDocument: String,
    dsVerification: { approvalNote: String, date: Date, signature: String },
    dsDocument: String,
    rejectionReason: String,

    // Publication
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cause", causeSchema);
