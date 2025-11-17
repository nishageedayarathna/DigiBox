const express = require("express");
const Cause = require("../models/causeModel");
const User = require("../models/userModel");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/* ============================================================
   TEMP EMAIL FUNCTION (PREVENTS 500 ERRORS)
   ============================================================ */
const sendApprovalEmail = async (email, causeTitle, approved) => {
  console.log(
    `EMAIL SENT → ${email} | CAUSE → ${causeTitle} | STATUS → ${approved ? "APPROVED" : "REJECTED"}`
  );
};


/* ============================================================
   ADMIN ANALYTICS
   ============================================================ */
router.get("/analytics", protect, authorize("admin"), async (req, res) => {
  try {
    const totalCauses = await Cause.countDocuments();
    const approvedCauses = await Cause.countDocuments({ status: "approved" });
    const rejectedCauses = await Cause.countDocuments({ status: "rejected" });
    const pendingCauses = await Cause.countDocuments({ status: "pending" });

    const activeCreators = await User.countDocuments({ role: "creator" });
    const approvalRate = totalCauses
      ? ((approvedCauses / totalCauses) * 100).toFixed(2)
      : 0;

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
    console.error("ANALYTICS ERROR:", err.message);
    res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
});


/* ============================================================
   GET ALL PENDING CAUSES
   ============================================================ */
router.get("/pending-causes", protect, authorize("admin"), async (req, res) => {
  try {
    const pendingCauses = await Cause.find({ status: "pending" }).populate(
      "creator",
      "username email"
    );
    res.json(pendingCauses);
  } catch (err) {
    console.error("PENDING FETCH ERROR:", err.message);
    res.status(500).json({ message: "Error fetching pending causes", error: err.message });
  }
});


/* ============================================================
   APPROVE CAUSE
   ============================================================ */
router.put("/approve/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id).populate(
      "creator",
      "username email"
    );

    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.status = "approved";
    await cause.save();

    await sendApprovalEmail(cause.creator.email, cause.title, true);

    res.json({ message: "Cause approved", cause });
  } catch (err) {
    console.error("APPROVE ERROR:", err.message);
    res.status(500).json({ message: "Error approving cause", error: err.message });
  }
});


/* ============================================================
   REJECT CAUSE
   ============================================================ */
router.put("/reject/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id).populate(
      "creator",
      "username email"
    );

    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.status = "rejected";
    await cause.save();

    await sendApprovalEmail(cause.creator.email, cause.title, false);

    res.json({ message: "Cause rejected", cause });
  } catch (err) {
    console.error("REJECT ERROR:", err.message);
    res.status(500).json({ message: "Error rejecting cause", error: err.message });
  }
});


/* ============================================================
   APPROVED CAUSES
   ============================================================ */
router.get("/approved-causes", protect, authorize("admin"), async (req, res) => {
  try {
    const approved = await Cause.find({ status: "approved" }).populate(
      "creator",
      "username email"
    );
    res.json({ totalApproved: approved.length, causes: approved });
  } catch (err) {
    console.error("APPROVED FETCH ERROR:", err.message);
    res.status(500).json({ message: "Error fetching approved causes", error: err.message });
  }
});


/* ============================================================
   REJECTED CAUSES
   ============================================================ */
router.get("/rejected-causes", protect, authorize("admin"), async (req, res) => {
  try {
    const rejected = await Cause.find({ status: "rejected" }).populate(
      "creator",
      "username email"
    );
    res.json({ totalRejected: rejected.length, causes: rejected });
  } catch (err) {
    console.error("REJECTED FETCH ERROR:", err.message);
    res.status(500).json({ message: "Error fetching rejected causes", error: err.message });
  }
});


/* ============================================================
   GET ALL USERS
   ============================================================ */
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("USER FETCH ERROR:", err.message);
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});


/* ============================================================
   DELETE USER
   ============================================================ */
router.delete("/users/:id", protect, authorize("admin"), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("USER DELETE ERROR:", err.message);
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});


module.exports = router;
