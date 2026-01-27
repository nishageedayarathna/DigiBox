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

/* ---------------- GS DASHBOARD ---------------- */
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

    // Only consider causes where admin approved
    const totalCauses = await Cause.countDocuments({
      areaCode: user.areaCode,
      adminStatus: "approved",
    });

    const pendingCauses = await Cause.countDocuments({
      areaCode: user.areaCode,
      adminStatus: "approved",
      gsStatus: "pending",
    });

    const approvedCauses = await Cause.countDocuments({
      areaCode: user.areaCode,
      adminStatus: "approved",
      gsStatus: "approved",
    });

    const rejectedCauses = await Cause.countDocuments({
      areaCode: user.areaCode,
      adminStatus: "approved",
      gsStatus: "rejected",
    });

    // Monthly analytics only for admin-approved causes
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const rawData = await Cause.aggregate([
      {
        $match: {
          areaCode: user.areaCode,
          adminStatus: "approved",
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


// GET PENDING CAUSES (only after admin approval)
router.get("/pending-causes", protect, authorize("gs"), async (req, res) => {
  try {
    const causes = await Cause.find({
      adminStatus: "approved",   // only approved by admin
      gsStatus: "pending",
      areaCode: req.user.areaCode,
    }).populate("creator", "username email");

    res.json(causes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch pending causes" });
  }
});


/* ---------------- APPROVE CAUSE + GENERATE PDF ---------------- */
router.put("/approve/:id", protect, authorize("gs"), async (req, res) => {
  try {
    const { verificationNotes, signatureImage } = req.body;
    if (!verificationNotes || !signatureImage) return res.status(400).json({ message: "Notes and signature required" });

    const cause = await Cause.findById(req.params.id).populate("creator");
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    // Update GS info
    cause.gsStatus = "approved";
    cause.gsOfficer = req.user._id;
    cause.gsVerification = {
      remarks: verificationNotes,
      date: new Date(),
      signature: "", // optional
    };

    // Ensure uploads folder exists
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    // PDF generation with letterhead
    const pdfPath = path.join(uploadDir, `gs_approval_${cause._id}.pdf`);
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(fs.createWriteStream(pdfPath));

    // Optional logo
    const logoPath = path.join(__dirname, "../public/logo.png");
    if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 45, { width: 100 });

    doc.fontSize(20).text("GS Approval Letter", 105, 150, { align: "center" });
    doc.moveDown(2);
    doc.fontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.text(`Cause Title: ${cause.title}`);
    doc.text(`Creator: ${cause.creator.username}`);
    doc.text(`Amount Required: LKR ${cause.requiredAmount}`);
    doc.text(`Beneficiary: ${cause.beneficiaryName}`);
    doc.moveDown();
    doc.text("Verification Notes:");
    doc.text(verificationNotes);
    doc.moveDown();

    // Add signature
    const imgBuffer = Buffer.from(signatureImage.replace(/^data:image\/\w+;base64,/, ""), "base64");
    doc.image(imgBuffer, { width: 150 });
    doc.text(`Signed by: ${req.user.username}`);

    doc.end();

    // Save PDF path
    cause.gsDocument = `/uploads/gs_approval_${cause._id}.pdf`;
    await cause.save();

    // Notify DS officer
    if (cause.dsOfficer) {
  const dsUser = await User.findById(cause.dsOfficer);
  if (dsUser) {
    const emailSubject = `GS Approval Notification: Cause "${cause.title}"`;
    
    const emailBody = `
Dear ${dsUser.username},

This is to formally notify you that the cause titled "${cause.title}" has been reviewed and approved by the Grama Niladhari (GS) Officer, ${req.user.username}, on ${new Date().toLocaleDateString()}.

GS Officer Remarks:
${verificationNotes}

You are requested to proceed with the next steps for further processing of this cause.

Thank you for your attention.

Best regards,
DigiBox Donation System
`;

    await sendEmail(dsUser.email, emailSubject, emailBody);
  }
}



    res.json({ message: "Cause approved and forwarded to DS officer", cause });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  }
});

/* ---------------- REJECT CAUSE ---------------- */
router.put("/reject/:id", protect, authorize("gs"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Reason required" });

    const cause = await Cause.findById(req.params.id).populate("creator");
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.gsStatus = "rejected";
    cause.finalStatus = "rejected";
    cause.rejectionReason = reason;
    await cause.save();

    // Send rejection email to creator
    try {
      const rejectionEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cause Rejected - GS Review</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .rejection-notice { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .reason-box { background: white; padding: 15px; border-left: 4px solid #dc3545; margin: 15px 0; }
    .officer-info { background: #e9ecef; padding: 10px; border-radius: 3px; margin: 15px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Cause Rejected - GS Review</h1>
      <p>Your cause was not approved at the Grama Niladhari level</p>
    </div>

    <div class="content">
      <p>Hello <strong>${cause.creator.username}</strong>,</p>

      <div class="rejection-notice">
        <h3>❌ GS Rejection Notice</h3>
        <p>Your cause "<strong>${cause.title}</strong>" has been reviewed by the Grama Niladhari Officer and was not approved for further processing.</p>
      </div>

      <div class="officer-info">
        <strong>Reviewed by:</strong> ${req.user.username} (GS Officer)<br>
        <strong>Area:</strong> ${req.user.areaName}<br>
        <strong>Division:</strong> ${req.user.divisionName}, ${req.user.districtName}
      </div>

      <div class="reason-box">
        <h4>Reason for Rejection:</h4>
        <p><em>${reason}</em></p>
      </div>

      <p><strong>What you can do next:</strong></p>
      <ul>
        <li>Review the GS officer's feedback</li>
        <li>Address the specific concerns mentioned</li>
        <li>Consider reapplying with corrected information</li>
        <li>Contact your local GS office for clarification if needed</li>
      </ul>

      <p>Please note that GS rejections are final for the current submission. You may submit a new cause application after addressing the issues.</p>

      <div class="footer">
        <p>Best regards,<br><strong>DigiBox GS Review Team</strong></p>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

      await sendEmail(
        cause.creator.email,
        "❌ Cause Rejected - GS Review - DigiBox",
        `Hello ${cause.creator.username},\n\nYour cause "${cause.title}" has been rejected by the GS Officer (${req.user.username}).\n\nReason: ${reason}\n\nArea: ${req.user.areaName}\nDivision: ${req.user.divisionName}\n\nPlease review the feedback and consider reapplying.\n\nBest regards,\nDigiBox GS Team`,
        rejectionEmail
      );
    } catch (emailError) {
      console.error("Failed to send GS rejection email:", emailError);
    }

    // Notify admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await sendEmail(admin.email, "Cause Rejected by GS", `Cause "${cause.title}" rejected by GS Officer ${req.user.username}.\nReason: ${reason}`);
    }

    res.json({ message: "Cause rejected successfully" });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed" });
  }
});

/* ---------------- RESET PASSWORD ---------------- */
router.put("/reset-password", protect, authorize("gs"), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: "Password required" });

    const user = await User.findById(req.user.id);
    user.password = await bcrypt.hash(newPassword, 10);
    user.mustResetPassword = false;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed" });
  }
});

/* ---------------- GET GS DOCUMENTS ---------------- */
router.get("/documents", protect, authorize("gs"), async (req, res) => {
  try {
    const docs = await Cause.find({
      areaCode: req.user.areaCode,
      gsDocument: { $exists: true },
    }).populate("gsOfficer", "username").select("title gsDocument updatedAt gsOfficer");

    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching documents" });
  }
});

router.get("/all-causes", protect, authorize("gs"), async (req, res) => {
  try {
    const { status } = req.query;

    // Base query: only admin-approved causes in GS officer's area
    let query = {
      areaCode: req.user.areaCode,
      adminStatus: "approved",
    };

    // Filter by GS status if specified
    if (status === "pending") query.gsStatus = "pending";
    else if (status === "approved") query.gsStatus = "approved";
    else if (status === "rejected") query.gsStatus = "rejected";
    else {
      // If status is "all" or undefined, include all GS statuses
      query.gsStatus = { $in: ["pending", "approved", "rejected"] };
    }

    const causes = await Cause.find(query)
      .populate("creator", "username email")
      .sort({ createdAt: -1 });

    res.json(causes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching all causes" });
  }
});


module.exports = router;
