const express = require("express");
const multer = require("multer");
const path = require("path");
const Cause = require("../models/causeModel");
const User = require("../models/userModel");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

/* ---------- Multer setup ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  cb(null, allowed.includes(file.mimetype));
};
const upload = multer({ storage, fileFilter });

/* ---------- Create Cause ---------- */
router.post("/create", protect, authorize("creator"), upload.single("evidenceFile"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Evidence file required" });
    if (req.file.size > 5 * 1024 * 1024) return res.status(400).json({ message: "File > 5MB" });

    // Validate contact and account
    if (!/^07\d{8}$/.test(req.body.beneficiaryContact)) return res.status(400).json({ message: "Invalid contact" });
    if (!/^\d{6,20}$/.test(req.body.beneficiaryAccountNumber)) return res.status(400).json({ message: "Invalid account" });

    // Map GS and DS automatically
    const gsOfficer = await User.findOne({ role: "gs", areaCode: req.body.areaCode });
    if (!gsOfficer) return res.status(400).json({ message: "Invalid GS area" });

    const dsOfficer = await User.findOne({ role: "ds", divisionCode: gsOfficer.divisionCode });
    if (!dsOfficer) return res.status(400).json({ message: "No DS found for this division" });

    const cause = new Cause({
      creator: req.user._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      requiredAmount: Number(req.body.requiredAmount),
      beneficiaryName: req.body.beneficiaryName,
      beneficiaryContact: req.body.beneficiaryContact,
      beneficiaryAccountName: req.body.beneficiaryAccountName,
      beneficiaryBank: req.body.beneficiaryBank,
      beneficiaryAccountNumber: req.body.beneficiaryAccountNumber,
      beneficiaryBranch: req.body.beneficiaryBranch,
      evidenceFile: `/uploads/${req.file.filename}`,
      evidenceFileType: req.file.mimetype === "application/pdf" ? "pdf" : "image",

      districtCode: gsOfficer.districtCode,
      districtName: gsOfficer.districtName,
      divisionCode: gsOfficer.divisionCode,
      divisionName: gsOfficer.divisionName,
      areaCode: gsOfficer.areaCode,
      areaName: gsOfficer.areaName,

      gsOfficer: gsOfficer._id,
      dsOfficer: dsOfficer._id,
    });

    await cause.save();
    res.status(201).json({ message: "Cause created", cause });
  } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
});

/* ---------- Get My Causes ---------- */
router.get("/my-causes", protect, authorize("creator"), async (req, res) => {
  try {
    const causes = await Cause.find({ creator: req.user._id })
      .populate("gsOfficer", "username email")
      .populate("dsOfficer", "username email")
      .sort({ createdAt: -1 });

    const formatted = causes.map(cause => {
      let displayStatus = "Pending Admin Approval";

      if (cause.adminStatus === "rejected") {
        displayStatus = "Rejected by Admin";
      } else if (cause.adminStatus === "approved" && cause.gsStatus === "pending") {
        displayStatus = "Pending GS Approval";
      } else if (cause.gsStatus === "rejected") {
        displayStatus = "Rejected by GS";
      } else if (cause.gsStatus === "approved" && cause.dsStatus === "pending") {
        displayStatus = "Pending DS Approval";
      } else if (cause.dsStatus === "rejected") {
        displayStatus = "Rejected by DS";
      } else if (cause.dsStatus === "approved") {
        displayStatus = "Approved";
      }

      return {
        ...cause.toObject(),
        displayStatus
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ---------- Download evidence file ---------- */
router.get("/file/:filename", protect, (req, res) => {
  res.sendFile(path.join(__dirname, "../uploads", req.params.filename));
});

/* ---------- Admin Approve/Reject Workflow ---------- */
router.put("/gs-approve/:id", protect, authorize("gs"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });
    if (!cause.gsOfficer.equals(req.user._id)) return res.status(403).json({ message: "Not your cause" });

    cause.gsStatus = req.body.status; // approved/rejected
    await cause.save();
    res.json({ message: "GS status updated", cause });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put("/ds-approve/:id", protect, authorize("ds"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });
    if (!cause.dsOfficer.equals(req.user._id)) return res.status(403).json({ message: "Not your cause" });

    cause.dsStatus = req.body.status; // approved/rejected
    await cause.save();
    res.json({ message: "DS status updated", cause });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

/* ---------- Creator Dashboard Stats ---------- */
router.get("/stats", protect, authorize("creator"), async (req, res) => {
  try {
    const userId = req.user._id;

    const totalCauses = await Cause.countDocuments({ creator: userId });

    const approved = await Cause.countDocuments({
      creator: userId,
      dsStatus: "approved"
    });

    const rejected = await Cause.countDocuments({
      creator: userId,
      $or: [
        { adminStatus: "rejected" },
        { gsStatus: "rejected" },
        { dsStatus: "rejected" }
      ]
    });

    const pending = totalCauses - approved - rejected;

    const totalFundsAgg = await Cause.aggregate([
      { $match: { creator: userId, dsStatus: "approved" } },
      { $group: { _id: null, total: { $sum: "$fundsRaised" } } }
    ]);

    const totalFunds = totalFundsAgg[0]?.total || 0;

    res.json({ totalCauses, approved, pending, rejected, totalFunds });
  } catch (err) {
    res.status(500).json({ message: "Error fetching creator stats" });
  }
});


/* ---------- Creator Monthly Causes ---------- */
router.get("/analytics/monthly", protect, authorize("creator"), async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const monthlyData = await Cause.aggregate([
      { $match: { creator: userId, createdAt: { $gte: startOfYear } } },
      { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.month": 1 } }
    ]);

    // Fill missing months with 0
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: 0
    }));
    monthlyData.forEach(m => months[m._id.month - 1].count = m.count);

    res.json(months); // [{month:1,count:3},...]
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching monthly causes" });
  }
});



module.exports = router;
