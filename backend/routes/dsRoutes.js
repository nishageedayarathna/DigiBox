const express = require("express");
const Cause = require("../models/causeModel");
const { protect, authorize } = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");

const router = express.Router();

// GET pending causes for DS
router.get("/pending-causes", protect, authorize("ds"), async (req, res) => {
  try {
    const causes = await Cause.find({ gsStatus: "approved", dsStatus: "pending", areaCode: req.user.areaCode });
    res.json(causes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching causes", error: err.message });
  }
});

// DS approves → notify creator
router.put("/approve/:id", protect, authorize("ds"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id).populate("creator");
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.dsStatus = "approved";
    cause.status = "approved"; // visible to donors
    await cause.save();

    // Notify creator
    await sendEmail(
      cause.creator.email,
      `Cause "${cause.title}" Fully Approved`,
      `Hello ${cause.creator.username},\n\nYour cause "${cause.title}" has been fully approved and is now visible to donors.\n\nThank you.`
    );

    res.json({ message: "DS approved & creator notified", cause });
  } catch (err) {
    res.status(500).json({ message: "Error approving cause", error: err.message });
  }
});

module.exports = router;
