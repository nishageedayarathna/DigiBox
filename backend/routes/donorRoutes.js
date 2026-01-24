const express = require("express");
const Cause = require("../models/causeModel");
const Donation = require("../models/donationModel");
const sendEmail = require("../utils/email");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

/* ======================================================
   CATEGORY → IMAGE AUTO ASSIGNMENT
====================================================== */
const categoryImages = {
  Health: "/assets/images/health.jpg",
  Education: "/assets/images/education.jpg",
  Disaster: "/assets/images/disaster.jpg",
  Poverty: "/assets/images/poverty.jpg",
  Environment: "/assets/images/environment.jpg",
  Other: "/assets/images/default.jpg"
};

const assignCauseImage = (cause) => {
  return {
    ...cause._doc,
    image: cause.image || categoryImages[cause.category] || categoryImages.Other
  };
};

/* ======================================================
   HELPER: BADGE CALCULATION
====================================================== */
const calculateBadge = (total) => {
  if (total >= 15000) return "Gold";
  if (total >= 5000) return "Silver";
  return "Bronze";
};

/* ======================================================
   1. DONOR DASHBOARD SUMMARY
====================================================== */
router.get("/summary", protect, authorize("donor"), async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id });

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const supportedCauses = new Set(donations.map(d => d.cause.toString()));

    const badge = calculateBadge(totalDonated);

    let nextTarget = 5000;
    if (badge === "Silver") nextTarget = 15000;
    if (badge === "Gold") nextTarget = totalDonated;

    res.json({
      username: req.user.username,
      totalDonated,
      badge,
      progressTarget: nextTarget,
      totalCausesSupported: supportedCauses.size,
      totalDonations: donations.length
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard summary" });
  }
});

/* ======================================================
   2. VIEW ACTIVE CAUSES (SEARCH + CATEGORY FILTER)
====================================================== */
router.get("/causes", protect, authorize("donor"), async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = {
      isPublished: true,
      isCompleted: false
    };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const causes = await Cause.find(query).sort({ createdAt: -1 });
    const updatedCauses = causes.map(assignCauseImage);

    res.json(updatedCauses);
  } catch (err) {
    res.status(500).json({ message: "Failed to load causes" });
  }
});

/* ======================================================
   3. VIEW COMPLETED CAUSES
====================================================== */
router.get("/causes/completed", protect, authorize("donor"), async (req, res) => {
  try {
    const causes = await Cause.find({
      isPublished: true,
      isCompleted: true
    }).sort({ updatedAt: -1 });

    res.json(causes.map(assignCauseImage));
  } catch (err) {
    res.status(500).json({ message: "Failed to load completed causes" });
  }
});

/* ======================================================
   4. VIEW CAUSE DETAILS
====================================================== */
router.get("/causes/:id", protect, authorize("donor"), async (req, res) => {
  try {
    const cause = await Cause.findById(req.params.id);

    if (!cause || !cause.isPublished) {
      return res.status(404).json({ message: "Cause not found" });
    }

    res.json(assignCauseImage(cause));
  } catch (err) {
    res.status(500).json({ message: "Failed to load cause details" });
  }
});

/* ======================================================
   5. DONATE TO A CAUSE (MOCK TRANSACTION)
====================================================== */
router.post("/donate/:causeId", protect, authorize("donor"), async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid donation amount" });
    }

    const cause = await Cause.findById(req.params.causeId);

    if (!cause || !cause.isPublished) {
      return res.status(404).json({ message: "Cause not found" });
    }

    if (cause.isCompleted) {
      return res.status(400).json({ message: "Fundraising goal already reached" });
    }

    const transactionId = "TXN-" + Date.now();

    await Donation.create({
      donor: req.user._id,
      cause: cause._id,
      amount,
      paymentMethod,
      transactionId
    });

    cause.fundsRaised += amount;
    cause.donorsCount += 1;

    if (cause.fundsRaised >= cause.requiredAmount) {
      cause.isCompleted = true;
    }

    await cause.save();

    // Email confirmation
    await sendEmail(
      req.user.email,
      "Thank You for Your Donation – DigiBox",
      `
Hello ${req.user.username},

Thank you for supporting DigiBox.

Cause: ${cause.title}
Amount Donated: LKR ${amount}
Transaction ID: ${transactionId}

Your contribution makes a real difference.

Best regards,
DigiBox Donation Platform
`
    );

    res.status(201).json({
      message: "Donation successful",
      showThankYouPopup: true,
      receipt: {
        transactionId,
        causeTitle: cause.title,
        amount,
        date: new Date()
      },
      updatedFunds: cause.fundsRaised,
      isCompleted: cause.isCompleted
    });
  } catch (err) {
    res.status(500).json({ message: "Donation failed" });
  }
});

/* ======================================================
   6. DONATION HISTORY (RECEIPTS)
====================================================== */
router.get("/history", protect, authorize("donor"), async (req, res) => {
  try {
    const history = await Donation.find({ donor: req.user._id })
      .populate("cause", "title")
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to load donation history" });
  }
});

module.exports = router;
