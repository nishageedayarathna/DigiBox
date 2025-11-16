// routes/adminRoutes.js
const express = require("express");
const Cause = require("../models/causeModel");
const User = require("../models/userModel");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin Analytics
router.get("/analytics", protect, authorize("admin"), async (req, res) => {
  try {
    const totalCauses = await Cause.countDocuments();
    const approvedCauses = await Cause.countDocuments({ status: "approved" });
    const rejectedCauses = await Cause.countDocuments({ status: "rejected" });
    const pendingCauses = await Cause.countDocuments({ status: "pending" });

    const activeCreators = await User.countDocuments({ role: "creator" });

    const approvalRate = totalCauses ? ((approvedCauses / totalCauses) * 100).toFixed(2) : 0;

    // Recent activities: latest 5 causes (sorted by creation date)
    const recentActivities = await Cause.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("creator", "username email");

    res.json({
      totalCauses,
      approvalRate,
      pendingCauses,
      activeCreators,
      statusDistribution: {
        approved: approvedCauses,
        rejected: rejectedCauses,
        pending: pendingCauses,
      },
      recentActivities,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
});

// Get all pending causes
router.get("/pending-causes", protect, authorize("admin"), async (req, res) => {
  try {
    const pendingCauses = await Cause.find({ status: "pending" })
      .populate("creator", "username email");
    res.json(pendingCauses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending causes", error: err.message });
  }
});

// Approve a cause
router.put("/approve/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id).populate("creator", "username email");
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.status = "approved";
    await cause.save();

    // Send email to creator
    await sendApprovalEmail(cause.creator.email, cause.title, true);

    res.json({ message: "Cause approved", cause });
  } catch (err) {
    res.status(500).json({ message: "Error approving cause", error: err.message });
  }
});

// Reject a cause
router.put("/reject/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id).populate("creator", "username email");
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.status = "rejected";
    await cause.save();

    // Send email to creator
    await sendApprovalEmail(cause.creator.email, cause.title, false);

    res.json({ message: "Cause rejected", cause });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting cause", error: err.message });
  }
});

// Approved causes
router.get("/approved-causes", protect, authorize("admin"), async (req, res) => {
  try {
    const approved = await Cause.find({ status: "approved" }).populate("creator", "username email");
    res.json({ totalApproved: approved.length, causes: approved });
  } catch (err) {
    res.status(500).json({ message: "Error fetching approved causes", error: err.message });
  }
});

// Rejected causes
router.get("/rejected-causes", protect, authorize("admin"), async (req, res) => {
  try {
    const rejected = await Cause.find({ status: "rejected" }).populate("creator", "username email");
    res.json({ totalRejected: rejected.length, causes: rejected });
  } catch (err) {
    res.status(500).json({ message: "Error fetching rejected causes", error: err.message });
  }
});



module.exports = router;
