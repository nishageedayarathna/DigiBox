const mongoose = require("mongoose");

const causeSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  title: { type: String, required: true },
  description: { type: String, required: true },

  requiredAmount: { type: Number, required: true },
  collectedAmount: { type: Number, default: 0 },

  beneficiaryName: { type: String, required: true },
  beneficiaryContact: { type: String, required: true },

  // ✅ Beneficiary banking details
  beneficiaryAccountName: { type: String, required: true },
  beneficiaryBank: { type: String, required: true },
  beneficiaryAccountNumber: { type: String, required: true },
  beneficiaryBranch: { type: String, required: true },

  evidenceFile: { type: String, required: true },
  evidenceFileType: { type: String, enum: ["image", "pdf"], required: true },

  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }

}, { timestamps: true });

module.exports = mongoose.model("Cause", causeSchema);
