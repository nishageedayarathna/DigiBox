// routes/donorRoutes.js
const express = require("express");
const Cause = require("../models/causeModel");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all approved causes for donors
router.get("/approved-causes", protect, authorize("donor"), async (req, res) => {
  try {
    const causes = await Cause.find({ status: "approved" }).populate("creator", "username email");
    res.json(causes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching causes", error: err.message });
  }
});

module.exports = router;
