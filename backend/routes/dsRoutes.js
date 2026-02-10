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

/* ---------------- DS DASHBOARD ---------------- */
router.get("/dashboard", protect, authorize("ds"), async (req, res) => {
  try {
    const user = req.user;

    const welcomeInfo = {
      message: `Welcome ${user.username} to the DigiBox Donation System!`,
      dsOfficer: {
        username: user.username,
        email: user.email,
        district: user.districtName,
        division: user.divisionName,
      },
    };

    // Only consider GS-approved causes in DS officer's area
    const query = {
      divisionCode: user.divisionCode,
      gsStatus: "approved",   // <-- only GS-approved causes
    };

    const totalCauses = await Cause.countDocuments(query);

    const pendingCauses = await Cause.countDocuments({ ...query, dsStatus: "pending" });
    const approvedCauses = await Cause.countDocuments({ ...query, dsStatus: "approved" });
    const rejectedCauses = await Cause.countDocuments({ ...query, dsStatus: "rejected" });

    // Monthly analytics based on DS decisions only
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const rawData = await Cause.aggregate([
      {
        $match: {
          ...query,
          createdAt: { $gte: startOfYear },
          dsStatus: { $in: ["pending", "approved", "rejected"] },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, status: "$dsStatus" },
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
    res.status(500).json({ message: "Failed to load DS dashboard" });
  }
});




/* ---------------- PENDING CAUSES FOR DS ---------------- */
router.get("/pending-causes", protect, authorize("ds"), async (req, res) => {
  try {
    const causes = await Cause.find({
      divisionCode: req.user.divisionCode,
      gsStatus: "approved",   // ONLY GS-approved causes
      dsStatus: "pending",    // AND DS-pending causes
    })
      .populate("creator", "username email")
      .populate("gsOfficer", "username");

    res.json(causes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch DS pending causes" });
  }
});




/* ---------------- APPROVE CAUSE ---------------- */
router.put("/approve/:id", protect, authorize("ds"), async (req, res) => {
  try {
    const { approvalNote, signatureImage, pdfDocument } = req.body;
    if (!approvalNote || !signatureImage)
      return res.status(400).json({ message: "Approval note & signature required" });

    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.dsStatus = "approved";
    cause.finalStatus = "approved";
    cause.dsOfficer = req.user._id;

    cause.dsVerification = {
      approvalNote,
      date: new Date(),
      signature: "",
    };

    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

    // Save the formatted PDF from frontend
    if (pdfDocument) {
      const pdfPath = path.join(uploadDir, `ds_approval_${cause._id}.pdf`);
      const base64Data = pdfDocument.replace(/^data:application\/pdf;filename=generated\.pdf;base64,/, '');
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(pdfPath, pdfBuffer);
      cause.dsDocument = `/uploads/ds_approval_${cause._id}.pdf`;
    }

    await cause.save();

    // Notify Admin
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await sendEmail(
  "admin@example.com",
  "Cause Fully Approved – Ready for Donations",
  `
Hello Admin,

The following cause has been FULLY VERIFIED and APPROVED.

Cause Details:
- Title: ${cause.title}
- District: ${cause.districtName}
- Division: ${cause.divisionName}
- GS Area: ${cause.areaName}
- Required Amount: LKR ${cause.requiredAmount}

Verification Status:
✔ Admin Approved
✔ GS Verified (PDF attached)
✔ DS Approved (PDF attached)

This cause is now READY to BE RELEASED for public donations.

Please log in to the Admin Dashboard to:
- Review all evidence documents
- Publish the cause for donations

Thank you,
DigiBox Donation System
  `
);

    }

    res.json({ message: "Cause fully approved", cause });
  } catch (err) {
    res.status(500).json({ message: "DS approval failed" });
  }
});

/* ---------------- REJECT CAUSE ---------------- */
router.put("/reject/:id", protect, authorize("ds"), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "Reason required" });

    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    cause.dsStatus = "rejected";
    cause.finalStatus = "rejected";
    cause.rejectionReason = reason;
    await cause.save();

    // Send rejection email to creator
    try {
      const creator = await User.findById(cause.creator);
      if (creator) {
        const rejectionEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Cause Rejected - DS Review</title>
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
      <h1>⚠️ Cause Rejected - DS Review</h1>
      <p>Your cause was not approved at the Divisional level</p>
    </div>

    <div class="content">
      <p>Hello <strong>${creator.username}</strong>,</p>

      <div class="rejection-notice">
        <h3>❌ DS Rejection Notice</h3>
        <p>Your cause "<strong>${cause.title}</strong>" has been reviewed by the Divisional Secretary and was not approved for publication.</p>
      </div>

      <div class="officer-info">
        <strong>Reviewed by:</strong> ${req.user.username} (Divisional Secretary)<br>
        <strong>Division:</strong> ${req.user.divisionName}<br>
        <strong>District:</strong> ${req.user.districtName}
      </div>

      <div class="reason-box">
        <h4>Reason for Rejection:</h4>
        <p><em>${reason}</em></p>
      </div>

      <p><strong>What this means:</strong></p>
      <ul>
        <li>This cause has completed the full review process</li>
        <li>The rejection is final for this submission</li>
        <li>You may submit a new cause application</li>
        <li>Consider the feedback for future submissions</li>
      </ul>

      <p>If you need clarification about the rejection or have questions about the DigiBox process, please contact your local Divisional Secretariat.</p>

      <div class="footer">
        <p>Best regards,<br><strong>DigiBox DS Review Team</strong></p>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

        await sendEmail(
          creator.email,
          "❌ Cause Rejected - DS Review - DigiBox",
          `Hello ${creator.username},\n\nYour cause "${cause.title}" has been rejected by the Divisional Secretary (${req.user.username}).\n\nReason: ${reason}\n\nDivision: ${req.user.divisionName}\nDistrict: ${req.user.districtName}\n\nThis completes the review process for this cause.\n\nBest regards,\nDigiBox DS Team`,
          rejectionEmail
        );
      }
    } catch (emailError) {
      console.error("Failed to send DS rejection email:", emailError);
    }

    // Notify admins
    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await sendEmail(
        admin.email,
        "Cause Rejected by DS",
        `Cause "${cause.title}" rejected by DS Officer ${req.user.username}.\nReason: ${reason}`
      );
    }

    res.json({ message: "Cause rejected and admin notified" });
  } catch {
    res.status(500).json({ message: "Rejection failed" });
  }
});

/* ---------------- RESET PASSWORD ---------------- */
router.put("/reset-password", protect, authorize("ds"), async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.mustResetPassword = false;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("DS reset password error:", err);
    res.status(500).json({ message: "Password reset failed" });
  }
});


/* ---------------- GET DS DOCUMENTS ---------------- */
router.get("/documents", protect, authorize("ds"), async (req, res) => {
  try {
    const docs = await Cause.find({
      divisionCode: req.user.divisionCode,
      dsStatus: "approved",
      dsDocument: { $exists: true, $ne: null },
    })
      .populate("dsOfficer", "username")
      .select("title dsDocument updatedAt dsOfficer")
      .sort({ updatedAt: -1 });

    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching DS documents" });
  }
});

router.get("/all-causes", protect, authorize("ds"), async (req, res) => {
  try {
    const { status } = req.query;

    // Base query: only GS-approved in the DS officer's division
    let query = {
      divisionCode: req.user.divisionCode,
      gsStatus: "approved",
    };

    // Filter by DS status only if specified
    if (status === "pending") query.dsStatus = "pending";
    if (status === "approved") query.dsStatus = "approved";
    if (status === "rejected") query.dsStatus = "rejected";

    // If status is "all" or undefined, include all DS statuses (pending, approved, rejected)
    if (!status || status === "all") {
      query.dsStatus = { $in: ["pending", "approved", "rejected"] };
    }

    const causes = await Cause.find(query)
      .populate("creator", "username email")
      .populate("gsOfficer", "username")
      .sort({ createdAt: -1 });

    res.json(causes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching all causes" });
  }
});


module.exports = router;
