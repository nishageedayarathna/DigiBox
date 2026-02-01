const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Cause = require("../models/causeModel");
const User = require("../models/userModel");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Multer setup ---------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"))
});

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf"];
  cb(null, allowed.includes(file.mimetype));
};

const upload = multer({ storage, fileFilter });

/* ---------- Create Cause ---------- */
router.post(
  "/create",
  protect,
  authorize("creator"),
  upload.single("evidenceFile"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Evidence file required" });
      if (req.file.size > 2 * 1024 * 1024)
        return res.status(400).json({
          message:
            "File exceeds 2MB limit. Please compress your PDF or reduce image quality."
        });

<<<<<<< HEAD
    // Validate all required fields
    const { title, description, category, requiredAmount, beneficiaryName, beneficiaryContact, beneficiaryAddress, beneficiaryNIC, beneficiaryAccountName, beneficiaryBank, beneficiaryAccountNumber, beneficiaryBranch, areaCode } = req.body;
    
    if (!title || title.trim().length < 10) return res.status(400).json({ message: "Title must be at least 10 characters" });
    if (!description || description.trim().length < 30) return res.status(400).json({ message: "Description must be at least 30 characters" });
    if (!category) return res.status(400).json({ message: "Category is required" });
    if (!requiredAmount || Number(requiredAmount) < 1000) return res.status(400).json({ message: "Required amount must be at least LKR 1,000" });
    
    if (!beneficiaryName || beneficiaryName.trim().length < 3) return res.status(400).json({ message: "Beneficiary name must be at least 3 characters" });
    if (!beneficiaryContact || !/^07\d{8}$/.test(beneficiaryContact.trim())) return res.status(400).json({ message: "Invalid Sri Lankan contact number (07XXXXXXXX)" });
    if (!beneficiaryAddress || beneficiaryAddress.trim().length < 10) return res.status(400).json({ message: "Beneficiary address must be at least 10 characters" });
    
    const nicTrimmed = beneficiaryNIC.trim().toUpperCase();
    if (!beneficiaryNIC || !((/^\d{12}$/.test(nicTrimmed)) || (/^\d{9}[VvXx]$/.test(nicTrimmed)))) return res.status(400).json({ message: "Invalid NIC number. Must be 12 digits or 9 digits followed by V/X" });
    
    if (!beneficiaryAccountName || beneficiaryAccountName.trim().length < 3) return res.status(400).json({ message: "Account name must be at least 3 characters" });
    if (!beneficiaryBank || beneficiaryBank.trim().length < 3) return res.status(400).json({ message: "Bank name must be at least 3 characters" });
    if (!beneficiaryAccountNumber || !/^\d{6,20}$/.test(beneficiaryAccountNumber.trim())) return res.status(400).json({ message: "Account number must be 6–20 digits" });
    if (!beneficiaryBranch || beneficiaryBranch.trim().length < 2) return res.status(400).json({ message: "Branch must be at least 2 characters" });
    
    if (!areaCode) return res.status(400).json({ message: "Area code (GS area) is required" });
=======
      const {
        title,
        description,
        category,
        requiredAmount,
        beneficiaryName,
        beneficiaryContact,
        beneficiaryAddress,
        beneficiaryNIC,
        beneficiaryAccountName,
        beneficiaryBank,
        beneficiaryAccountNumber,
        beneficiaryBranch,
        areaCode
      } = req.body;
>>>>>>> 51b95d497047f812f19830254d7f313eaeceae20

      if (!title || title.length < 10)
        return res.status(400).json({ message: "Title must be at least 10 characters" });
      if (!description || description.length < 30)
        return res
          .status(400)
          .json({ message: "Description must be at least 30 characters" });
      if (!category) return res.status(400).json({ message: "Category is required" });
      if (!requiredAmount || Number(requiredAmount) < 1000)
        return res
          .status(400)
          .json({ message: "Required amount must be at least LKR 1,000" });

      if (!beneficiaryName || beneficiaryName.length < 3)
        return res.status(400).json({ message: "Beneficiary name must be at least 3 characters" });
      if (!beneficiaryContact || !/^07\d{8}$/.test(beneficiaryContact))
        return res.status(400).json({ message: "Invalid Sri Lankan contact number (07XXXXXXXX)" });
      if (!beneficiaryAddress || beneficiaryAddress.trim().length < 10)
        return res.status(400).json({ message: "Beneficiary address must be at least 10 characters" });
      if (
        !beneficiaryNIC ||
        !(/^\d{12}$/.test(beneficiaryNIC) || /^\d{9}[VvXx]$/.test(beneficiaryNIC))
      )
        return res.status(400).json({
          message: "Invalid NIC number. Must be 12 digits or 9 digits followed by V/X"
        });

      if (!beneficiaryAccountName || beneficiaryAccountName.length < 3)
        return res.status(400).json({ message: "Account name must be at least 3 characters" });
      if (!beneficiaryBank || beneficiaryBank.length < 3)
        return res.status(400).json({ message: "Bank name must be at least 3 characters" });
      if (!beneficiaryAccountNumber || !/^\d{6,20}$/.test(beneficiaryAccountNumber))
        return res.status(400).json({ message: "Account number must be 6–20 digits" });
      if (!beneficiaryBranch || beneficiaryBranch.length < 2)
        return res.status(400).json({ message: "Branch must be at least 2 characters" });

      if (!areaCode)
        return res.status(400).json({ message: "Area code (GS area) is required" });

      const gsOfficer = await User.findOne({ role: "gs", areaCode });
      if (!gsOfficer)
        return res.status(400).json({ message: `No GS officer assigned to area code: ${areaCode}` });

      const dsOfficer = await User.findOne({ role: "ds", divisionCode: gsOfficer.divisionCode });
      if (!dsOfficer)
        return res.status(400).json({ message: `No DS officer found for this division` });

      const cause = new Cause({
        creator: req.user._id,
        title: title.trim(),
        description: description.trim(),
        category,
        requiredAmount: Number(requiredAmount),
        beneficiaryName: beneficiaryName.trim(),
        beneficiaryContact: beneficiaryContact.trim(),
        beneficiaryAddress: beneficiaryAddress.trim(),
        beneficiaryNIC: beneficiaryNIC.trim().toUpperCase(),
        beneficiaryAccountName: beneficiaryAccountName.trim(),
        beneficiaryBank: beneficiaryBank.trim(),
        beneficiaryAccountNumber: beneficiaryAccountNumber.trim(),
        beneficiaryBranch: beneficiaryBranch.trim(),
        evidenceFile: `/uploads/${req.file.filename}`,
        evidenceFileType: "pdf",

        districtCode: gsOfficer.districtCode,
        districtName: gsOfficer.districtName,
        divisionCode: gsOfficer.divisionCode,
        divisionName: gsOfficer.divisionName,
        areaCode: gsOfficer.areaCode,
        areaName: gsOfficer.areaName,

        gsOfficer: gsOfficer._id,
        dsOfficer: dsOfficer._id
      });

      await cause.save();
      res.status(201).json({ message: "Cause created successfully", cause });
    } catch (err) {
      console.error("Create cause error:", err);
      res.status(500).json({ message: err.message || "Error creating cause" });
    }
  }
);

/* ---------- Get My Causes ---------- */
router.get("/my-causes", protect, authorize("creator"), async (req, res) => {
  try {
    const causes = await Cause.find({ creator: req.user._id })
      .select(
        "title description category requiredAmount fundsRaised donorsCount adminStatus gsStatus dsStatus finalStatus createdAt areaName divisionName districtName gsOfficer dsOfficer evidenceFile"
      )
      .populate("gsOfficer", "username email")
      .populate("dsOfficer", "username email")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = causes.map((cause) => {
      let displayStatus = "Pending Admin Approval";

      if (cause.adminStatus === "rejected") displayStatus = "Rejected by Admin";
      else if (cause.adminStatus === "approved" && cause.gsStatus === "pending")
        displayStatus = "Pending GS Approval";
      else if (cause.gsStatus === "rejected") displayStatus = "Rejected by GS";
      else if (cause.gsStatus === "approved" && cause.dsStatus === "pending")
        displayStatus = "Pending DS Approval";
      else if (cause.dsStatus === "rejected") displayStatus = "Rejected by DS";
      else if (cause.dsStatus === "approved") displayStatus = "Approved";

      return { ...cause, displayStatus };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------- Public route to download evidence PDF ---------- */
router.get("/file/:filename", (req, res) => {
  const filePath = path.join(__dirname, "../uploads", req.params.filename);

  if (!fs.existsSync(filePath))
    return res.status(404).json({ message: "File not found" });

  res.sendFile(filePath);
});

/* ---------- GS/DS Approvals ---------- */
router.put("/gs-approve/:id", protect, authorize("gs"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });
    if (!cause.gsOfficer.equals(req.user._id))
      return res.status(403).json({ message: "Not your cause" });

    cause.gsStatus = req.body.status; // approved/rejected
    await cause.save();
    res.json({ message: "GS status updated", cause });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/ds-approve/:id", protect, authorize("ds"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });
    if (!cause.dsOfficer.equals(req.user._id))
      return res.status(403).json({ message: "Not your cause" });

    cause.dsStatus = req.body.status; // approved/rejected
    await cause.save();
    res.json({ message: "DS status updated", cause });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------- Creator Stats ---------- */
router.get("/stats", protect, authorize("creator"), async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalCauses, approved, rejected, totalFundsAgg] = await Promise.all([
      Cause.countDocuments({ creator: userId }),
      Cause.countDocuments({ creator: userId, dsStatus: "approved" }),
      Cause.countDocuments({
        creator: userId,
        $or: [{ adminStatus: "rejected" }, { gsStatus: "rejected" }, { dsStatus: "rejected" }]
      }),
      Cause.aggregate([
        { $match: { creator: userId, dsStatus: "approved" } },
        { $group: { _id: null, total: { $sum: "$fundsRaised" } } }
      ])
    ]);

    const pending = totalCauses - approved - rejected;
    const totalFunds = totalFundsAgg[0]?.total || 0;

    res.json({ totalCauses, approved, pending, rejected, totalFunds });
  } catch (err) {
    res.status(500).json({ message: "Error fetching creator stats" });
  }
});

/* ---------- Creator Monthly Analytics ---------- */
router.get("/analytics/monthly", protect, authorize("creator"), async (req, res) => {
  try {
    const userId = req.user._id;
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const monthlyData = await Cause.aggregate([
      { $match: { creator: userId, createdAt: { $gte: startOfYear } } },
      { $group: { _id: { month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.month": 1 } }
    ]);

    const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }));
    monthlyData.forEach((m) => (months[m._id.month - 1].count = m.count));

    res.json(months);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching monthly causes" });
  }
});

module.exports = router;
