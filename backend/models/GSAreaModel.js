const mongoose = require("mongoose");

const gsAreaSchema = new mongoose.Schema({
  name: String,
  code: String,
  gsOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("GSArea", gsAreaSchema);
