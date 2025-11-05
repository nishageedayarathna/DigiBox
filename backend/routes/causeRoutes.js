const express = require("express");
const multer = require("multer");
const path = require("path");
const Cause = require("../models/causeModel");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Multer setup (local uploads) ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // e.g. 1612345678900-evidence.pdf
    const clean = file.originalname.replace(/\s+/g, "_");
    cb(null, Date.now() + "-" + clean);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, or PDF allowed"), false);
};

const upload = multer({ storage, fileFilter });

/* ---------- Create Cause (creator only) ---------- */
/*
Frontend must send multipart/form-data with fields:
title, description, requiredAmount, beneficiaryName, beneficiaryContact
and file field named: evidenceFile
*/
/* ---------- Create Cause (creator only) ---------- */
router.post(
  "/create",
  protect,
  authorize("creator"),
  upload.single("evidenceFile"),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "Evidence file required" });

      const fileType = req.file.mimetype === "application/pdf" ? "pdf" : "image";

      const cause = new Cause({
        creator: req.user._id,
        title: req.body.title,
        description: req.body.description,
        requiredAmount: Number(req.body.requiredAmount) || 0,

        beneficiaryName: req.body.beneficiaryName,
        beneficiaryContact: req.body.beneficiaryContact,

        // ✅ Added new fields for bank/security
        beneficiaryAccountName: req.body.beneficiaryAccountName,
        beneficiaryBank: req.body.beneficiaryBank,
        beneficiaryAccountNumber: req.body.beneficiaryAccountNumber,
        beneficiaryBranch: req.body.beneficiaryBranch,

        evidenceFile: `/uploads/${req.file.filename}`,
        evidenceFileType: fileType
      });

      await cause.save();
      return res.status(201).json({ message: "Cause created", cause });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error creating cause", error: err.message });
    }
  }
);


/* ---------- Get "My Causes" (creator) ---------- */
router.get("/my-causes", protect, authorize("creator"), async (req, res) => {
  try {
    const causes = await Cause.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json(causes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching causes", error: err.message });
  }
});

/* ---------- Dashboard stats for creator ---------- */
router.get("/stats", protect, authorize("creator"), async (req, res) => {
  try {
    const creatorId = req.user._id;

    const totalCauses = await Cause.countDocuments({ creator: creatorId });
    const approved = await Cause.countDocuments({ creator: creatorId, status: "approved" });
    const pending = await Cause.countDocuments({ creator: creatorId, status: "pending" });
    const rejected = await Cause.countDocuments({ creator: creatorId, status: "rejected" });

    const fundsAgg = await Cause.aggregate([
      { $match: { creator: creatorId } },
      { $group: { _id: null, total: { $sum: "$collectedAmount" } } }
    ]);

    const totalFunds = fundsAgg[0]?.total || 0;

    res.json({ totalCauses, approved, pending, rejected, totalFunds });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
});

/* ---------- Single cause ---------- */
router.get("/:id", protect, async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id).populate("creator", "username email");
    if (!cause) return res.status(404).json({ message: "Cause not found" });
    // If you want only creator or admin to access, you can check role here.
    res.json(cause);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cause", error: err.message });
  }
});

/* ---------- Monthly counts for chart (creator) ---------- */
router.get("/analytics/monthly", protect, authorize("creator"), async (req, res) => {
  try {
    const creatorId = req.user._id;
    // Group by month-year of createdAt
    const data = await Cause.aggregate([
      { $match: { creator: creatorId } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Map to array useful for chart: [{ year, month, count }]
    const result = data.map(d => ({
      year: d._id.year,
      month: d._id.month,
      count: d.count
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
});

/* ---------- Admin: list pending causes ---------- */
router.get("/pending", protect, authorize("admin"), async (req, res) => {
  try {
    const pending = await Cause.find({ status: "pending" }).populate("creator", "username email");
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: "Error fetching pending causes", error: err.message });
  }
});

/* ---------- Admin: approve / reject ---------- */
router.put("/approve/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const cause = await Cause.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!cause) return res.status(404).json({ message: "Cause not found" });
    res.json({ message: "Cause approved", cause });
  } catch (err) {
    res.status(500).json({ message: "Error approving", error: err.message });
  }
});

router.put("/reject/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const cause = await Cause.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!cause) return res.status(404).json({ message: "Cause not found" });
    res.json({ message: "Cause rejected", cause });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting", error: err.message });
  }
});

module.exports = router;
