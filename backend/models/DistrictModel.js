const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema({
  name: String,
  code: String,
  divisions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Division" }],
});

module.exports = mongoose.model("District", districtSchema);
