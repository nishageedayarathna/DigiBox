const express = require("express");
const Cause = require("../models/causeModel");
const User = require("../models/userModel");
const { protect, authorize } = require("../middleware/authMiddleware");
const sendEmail = require("../utils/email");

const router = express.Router();

// GET pending causes for GS
router.get("/pending-causes", protect, authorize("gs"), async (req, res) => {
  try {
    const causes = await Cause.find({ adminStatus: "approved", gsStatus: "pending", areaCode: req.user.areaCode });
    res.json(causes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching causes", error: err.message });
  }
});

// GS approves → notify DS
router.put("/approve/:id", protect, authorize("gs"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.gsStatus = "approved";
    await cause.save();

    // Notify DS
    const dsUsers = await User.find({ role: "ds", areaCode: cause.areaCode });
    dsUsers.forEach(async (ds) => {
      await sendEmail(
        ds.email,
        `Cause "${cause.title}" Awaiting Your Approval`,
        `Hello ${ds.username},\n\nA cause "${cause.title}" has been approved by GS and is waiting for your approval.\n\nThank you.`
      );
    });

    res.json({ message: "GS approved & DS notified", cause });
  } catch (err) {
    res.status(500).json({ message: "Error approving cause", error: err.message });
  }
});

module.exports = router;
