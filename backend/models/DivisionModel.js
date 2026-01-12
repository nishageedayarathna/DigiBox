const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema({
  name: String,
  code: String,
  dsOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gsAreas: [{ type: mongoose.Schema.Types.ObjectId, ref: "GSArea" }],
});


module.exports = mongoose.model("Division", divisionSchema);
