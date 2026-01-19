// routes/gsRoutes.js
const express = require("express");
const Cause = require("../models/causeModel");
const User = require("../models/userModel");
const { protect, authorize } = require("../middleware/authMiddleware");
const sendEmail = require("../utils/email");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const router = express.Router();

/* ----------------------------------------------------
   GS DASHBOARD DATA
---------------------------------------------------- */
router.get("/dashboard", protect, authorize("gs"), async (req, res) => {
  try {
    const user = req.user;

    const welcomeInfo = {
      message: `Welcome ${user.username} to the DigiBox Donation System!`,
      gsOfficer: {
        username: user.username,
        email: user.email,
        district: user.districtName,
        division: user.divisionName,
        area: user.areaName,
      },
    };

    const totalCauses = await Cause.countDocuments({ areaCode: user.areaCode });
    const pendingCauses = await Cause.countDocuments({
      areaCode: user.areaCode,
      gsStatus: "pending",
    });
    const approvedCauses = await Cause.countDocuments({
      areaCode: user.areaCode,
      gsStatus: "approved",
    });
    const rejectedCauses = await Cause.countDocuments({
      areaCode: user.areaCode,
      gsStatus: "rejected",
    });

    // Monthly analytics
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const rawData = await Cause.aggregate([
      {
        $match: {
          areaCode: user.areaCode,
          createdAt: { $gte: startOfYear },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, status: "$gsStatus" },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthlyAnalytics = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      pending: 0,
      approved: 0,
      rejected: 0,
    }));

    rawData.forEach((item) => {
      monthlyAnalytics[item._id.month - 1][item._id.status] = item.count;
    });

    res.json({
      welcomeInfo,
      totalCauses,
      pendingCauses,
      approvedCauses,
      rejectedCauses,
      monthlyAnalytics,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load GS dashboard" });
  }
});

/* ----------------------------------------------------
   GET PENDING CAUSES
---------------------------------------------------- */
router.get("/pending-causes", protect, authorize("gs"), async (req, res) => {
  try {
    const causes = await Cause.find({
      adminStatus: "approved",
      gsStatus: "pending",
      areaCode: req.user.areaCode,
    }).populate("creator", "username email");

    res.json(causes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending causes" });
  }
});

/* ----------------------------------------------------
   APPROVE CAUSE + GENERATE PDF
---------------------------------------------------- */
router.put("/approve/:id", protect, authorize("gs"), async (req, res) => {
  try {
    const { verificationNotes, signatureImage } = req.body;

    if (!verificationNotes || !signatureImage) {
      return res.status(400).json({ message: "Notes and signature required" });
    }

    const cause = await Cause.findById(req.params.id).populate("creator");
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    // Update status
    cause.gsStatus = "approved";
    cause.gsOfficer = req.user._id;
    await cause.save();

    // Ensure uploads folder exists
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    // Create PDF
    const pdfPath = path.join(uploadDir, `verification_${cause._id}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(16).text("GS Verification Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Cause: ${cause.title}`);
    doc.text(`Creator: ${cause.creator.username}`);
    doc.text(`Amount Required: LKR ${cause.requiredAmount}`);
    doc.moveDown();
    doc.text("Verification Notes:");
    doc.text(verificationNotes);
    doc.moveDown();

    const imgBuffer = Buffer.from(
      signatureImage.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    doc.image(imgBuffer, { width: 150 });
    doc.text(`Signed by: ${req.user.username}`);

    doc.end();

    cause.gsVerificationPDF = `/uploads/verification_${cause._id}.pdf`;
    await cause.save();

    // Notify DS
    if (cause.dsOfficer) {
      const dsUser = await User.findById(cause.dsOfficer);
      if (dsUser) {
        await sendEmail(
          dsUser.email,
          "Cause Approved by GS",
          `Cause "${cause.title}" has been approved by GS Officer ${req.user.username}.`
        );
      }
    }

    res.json({ message: "Cause approved and verified", cause });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  }
});

/* ----------------------------------------------------
   REJECT CAUSE
---------------------------------------------------- */
router.put("/reject/:id", protect, authorize("gs"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Reason required" });

    const cause = await Cause.findById(req.params.id).populate("creator");
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.gsStatus = "rejected";
    cause.rejectionReason = reason;
    await cause.save();

    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await sendEmail(
        admin.email,
        "Cause Rejected by GS",
        `Cause "${cause.title}" was rejected.\nReason: ${reason}`
      );
    }

    res.json({ message: "Cause rejected successfully" });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed" });
  }
});

/* ----------------------------------------------------
   RESET PASSWORD
---------------------------------------------------- */
router.put("/reset-password", protect, authorize("gs"), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword)
      return res.status(400).json({ message: "Password required" });

    const user = await User.findById(req.user.id);
    user.password = await bcrypt.hash(newPassword, 10);
    user.mustResetPassword = false;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
});
// ---------------- GS DOCUMENTS ----------------
router.get("/documents", protect, authorize("gs"), async (req, res) => {
  try {
    const docs = await Cause.find({
      areaCode: req.user.areaCode,
      gsVerificationPDF: { $exists: true }
    }).select("title gsVerificationPDF evidenceFile");

    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching documents" });
  }
});

module.exports = router;
