const express = require("express");
const bcrypt = require("bcryptjs");
const Cause = require("../models/causeModel");
const User = require("../models/userModel");
const District = require("../models/DistrictModel");
const Division = require("../models/DivisionModel");
const GSArea = require("../models/GSAreaModel");
const { protect, authorize } = require("../middleware/authMiddleware");
const sendEmail = require("../utils/email");

const router = express.Router();

router.get("/analytics", protect, authorize("admin"), async (req, res) => {
  try {
    const totalCauses = await Cause.countDocuments();

    const pendingAdmin = await Cause.countDocuments({
      adminStatus: "pending"
    });

    const approvedByAdmin = await Cause.countDocuments({
      adminStatus: "approved"
    });

    const rejectedByAdmin = await Cause.countDocuments({
      adminStatus: "rejected"
    });

    const sentToGS = await Cause.countDocuments({
      adminStatus: "approved",
      gsStatus: "pending"
    });

    const underDS = await Cause.countDocuments({
      gsStatus: "approved",
      dsStatus: "pending"
    });

    const fullyApproved = await Cause.countDocuments({
      finalStatus: "approved"
    });

    res.json({
      totalCauses,
      pendingAdmin,
      approvedByAdmin,
      rejectedByAdmin,
      sentToGS,
      underDS,
      fullyApproved
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//analytics-->piechart

router.get("/analytics/pie", protect, authorize("admin"), async (req, res) => {
  try {
    const data = {
      pendingAdmin: await Cause.countDocuments({ adminStatus: "pending" }),
      sentToGS: await Cause.countDocuments({ adminStatus: "approved", gsStatus: "pending" }),
      underDS: await Cause.countDocuments({ gsStatus: "approved", dsStatus: "pending" }),
      fullyApproved: await Cause.countDocuments({ finalStatus: "approved" }),
      rejected: await Cause.countDocuments({
        $or: [
          { adminStatus: "rejected" },
          { gsStatus: "rejected" },
          { dsStatus: "rejected" }
        ]
      })
    };

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


/* ---------------- VIEW ALL CAUSES ---------------- */
router.get("/causes", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status === "pending") query.adminStatus = "pending";
    if (status === "approved") query.adminStatus = "approved";
    if (status === "rejected") query.adminStatus = "rejected";

    const causes = await Cause.find(query)
      .populate("creator", "username email")
      .populate("gsOfficer", "username email")
      .populate("dsOfficer", "username email")
      .sort({ createdAt: -1 });

    res.json(causes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- ADD DS ---------------- */
router.post("/add-ds", protect, authorize("admin"), async (req, res) => {
  try {
    const { username, email, districtCode, districtName, divisionCode, divisionName } = req.body;

    const exists = await User.findOne({ role: "ds", divisionCode });
    if (exists) return res.status(400).json({ message: "DS already exists for this division" });

    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const ds = await User.create({
      username,
      email,
      role: "ds",
      districtCode,
      districtName,
      divisionCode,
      divisionName,
      password: hashedPassword,
      mustResetPassword: true,
    });

    // --- Email Notification ---
    try {
  const loginURL = "http://localhost:3000/login"; // update for production
  const message = `
  Hello ${username},

  You have been successfully added to the DigiBox Donation System for the division "${divisionName}" under "${districtName}" district.

  Your email: ${email}
  Temporary password: ${generatedPassword}

  Important:
  You should change the password after your first login. 
  Use this temporary password for your first login.

  Login here: ${loginURL}

  Thank you,
  DigiBox Team
  `;
  await sendEmail(email, "DigiBox Account Created – DS", message);
} catch (e) {
  console.error("Email sending error:", e.message);
}


    res.status(201).json({ message: "DS added successfully", officer: ds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error adding DS" });
  }
});

/* ---------------- ADD GS ---------------- */
router.post("/add-gs", protect, authorize("admin"), async (req, res) => {
  try {
    const { username, email, districtCode, districtName, divisionCode, divisionName, areaCode, areaName } = req.body;

    const exists = await User.findOne({ role: "gs", areaCode });
    if (exists) return res.status(400).json({ message: "GS already exists for this area" });

    const ds = await User.findOne({ role: "ds", divisionCode });
    if (!ds) return res.status(400).json({ message: "Add DS for this division first" });

    const generatedPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const gs = await User.create({
      username,
      email,
      role: "gs",
      districtCode,
      districtName,
      divisionCode,
      divisionName,
      areaCode,
      areaName,
      password: hashedPassword,
      mustResetPassword: true,
    });

    // --- Email Notification ---
    try {
  const loginURL = "http://localhost:3000/login"; // update for production
  const message = `
  Hello ${username},

  You have been successfully added to the DigiBox Donation System for the area "${areaName}" under division "${divisionName}" in "${districtName}" district.

  Your email: ${email}
  Temporary password: ${generatedPassword}

  Important:
  You should change the password after your first login. 
  Use this temporary password for your first login.

  Login here: ${loginURL}

  Thank you,
  DigiBox Team
  `;
  await sendEmail(email, "DigiBox Account Created – GS", message);
} catch (e) {
  console.error("Email sending error:", e.message);
}


    res.status(201).json({ message: "GS added successfully", officer: gs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error adding GS" });
  }
});

//manage users
router.get("/users", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

//delete users in manage users
router.delete("/users/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(400).json({ message: "Cannot delete admin" });
    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// Get all districts, divisions, and GS areas for cause creator dropdown
router.get("/gs-hierarchy", protect, authorize("creator"), async (req, res) => {
  try {
    // Get all GS officers
    const gsOfficers = await User.find({ role: "gs" }).select(
      "districtCode districtName divisionCode divisionName areaCode areaName -_id"
    );

    // Build hierarchical structure
    const hierarchy = {};

    gsOfficers.forEach(gs => {
      if (!hierarchy[gs.districtCode]) {
        hierarchy[gs.districtCode] = {
          districtName: gs.districtName,
          divisions: {}
        };
      }
      if (!hierarchy[gs.districtCode].divisions[gs.divisionCode]) {
        hierarchy[gs.districtCode].divisions[gs.divisionCode] = {
          divisionName: gs.divisionName,
          areas: []
        };
      }
      hierarchy[gs.districtCode].divisions[gs.divisionCode].areas.push({
        areaCode: gs.areaCode,
        areaName: gs.areaName
      });
    });

    res.json(hierarchy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching GS hierarchy" });
  }
});

/* ---------- FETCH CAUSES FOR ADMIN DASHBOARD ---------- */
router.get("/causes/admin-dashboard", protect, authorize("admin"), async (req, res) => {
  try {
    // Show only pending causes for admin
    const causes = await Cause.find({ adminStatus: "pending" })
      .populate("creator", "username email")
      .populate("gsOfficer", "username email")
      .populate("dsOfficer", "username email")
      .sort({ createdAt: -1 });

    res.json(causes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching causes" });
  }
});

/* ---------- ADMIN APPROVE & SEND TO GS / REJECT ---------- */
router.put("/causes/:id/admin-action", protect, authorize("admin"), async (req, res) => {
  try {
    const { action } = req.body; // "approve" or "reject"
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
    }

    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    if (action === "reject") {
      cause.adminStatus = "rejected";
      cause.gsStatus = "rejected";
      await cause.save();
      return res.json({ message: "Cause rejected by admin", cause });
    }

    // APPROVE → assign GS & send email
    cause.adminStatus = "approved";

    // Find GS officer for this cause's area and division
    const gsOfficer = await User.findOne({
      role: "gs",
      areaCode: cause.areaCode,
      divisionCode: cause.divisionCode,
    });

    if (!gsOfficer) return res.status(404).json({ message: "No GS officer found for this area/division" });

    cause.gsOfficer = gsOfficer._id;
    cause.gsStatus = "pending";
    await cause.save();

    // Send email to GS
    const loginURL = "http://localhost:3000/login";
    const message = `
Hello ${gsOfficer.username},

A new cause has been approved by the Admin and requires your approval.

Cause Title: ${cause.title}
Beneficiary: ${cause.beneficiaryName}
Required Amount: LKR ${cause.requiredAmount}
District: ${cause.districtName}
Division: ${cause.divisionName}
Area: ${cause.areaName}

Please login to DigiBox and review the cause:
${loginURL}

Thank you,
DigiBox Team
    `;
    await sendEmail(gsOfficer.email, "New Cause Pending Your Approval – DigiBox", message);

    res.json({ message: "Cause approved and sent to GS successfully", cause });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error performing admin action" });
  }
});

/* ---------- ADMIN STRUCTURE (DISTRICT → DIVISION → GS) ---------- */
router.get(
  "/admin-structure",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const users = await User.find({
        role: { $in: ["ds", "gs"] },
      }).select(
        "username email role districtCode districtName divisionCode divisionName areaCode areaName"
      );

      const structure = {};

      users.forEach((u) => {
        // District
        if (!structure[u.districtCode]) {
          structure[u.districtCode] = {
            districtCode: u.districtCode,
            districtName: u.districtName,
            divisions: {},
          };
        }

        // Division
        if (!structure[u.districtCode].divisions[u.divisionCode]) {
          structure[u.districtCode].divisions[u.divisionCode] = {
            divisionCode: u.divisionCode,
            divisionName: u.divisionName,
            dsOfficer: null,
            gsAreas: [],
          };
        }

        // DS Officer
        if (u.role === "ds") {
          structure[u.districtCode].divisions[u.divisionCode].dsOfficer = {
            username: u.username,
            email: u.email,
          };
        }

        // GS Officer
        if (u.role === "gs") {
          structure[u.districtCode].divisions[u.divisionCode].gsAreas.push({
            areaCode: u.areaCode,
            areaName: u.areaName,
            gsOfficer: {
              username: u.username,
              email: u.email,
            },
          });
        }
      });

      res.json(Object.values(structure));
    } catch (err) {
      console.error("Admin structure error:", err);
      res.status(500).json({ message: "Failed to load admin structure" });
    }
  }
);



/* ---------------- GET FULLY APPROVED CAUSES ---------------- */
router.get("/approved-causes", protect, authorize("admin"), async (req, res) => {
  try {
    const causes = await Cause.find({ finalStatus: "approved", isPublished: { $ne: true } })
      .populate("creator", "username email")
      .populate("gsOfficer", "username")
      .populate("dsOfficer", "username");
    res.json(causes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch approved causes" });
  }
});

/* ---------------- PUBLISH A CAUSE ---------------- */
router.put("/publish/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);
    if (!cause) return res.status(404).json({ message: "Cause not found" });

    if (cause.finalStatus !== "approved")
      return res.status(400).json({ message: "Cause must be fully approved first" });

    cause.isPublished = true;
    cause.publishedAt = new Date();
    cause.publishedBy = req.user._id;

    await cause.save();

    res.json({ message: "Cause published successfully", cause });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to publish cause" });
  }
});

module.exports = router;
