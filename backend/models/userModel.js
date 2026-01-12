const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["admin", "donor", "creator", "gs", "ds"],
      required: true,
    },

    // Administrative codes and names
    districtCode: String, // DS and GS
    districtName: String,
    divisionCode: String, // DS and GS
    divisionName: String,
    areaCode: String,     // GS only
    areaName: String,     // GS only

    password: { type: String, required: true },
    mustResetPassword: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
