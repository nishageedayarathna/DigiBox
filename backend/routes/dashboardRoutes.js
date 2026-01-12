const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ---------------------------
// CREATOR DASHBOARD
// ---------------------------
router.get("/creator-dashboard", protect, authorize("creator"), (req, res) => {
  res.json({
    message: "Welcome to the Cause Creator Dashboard!",
    user: {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// ---------------------------
// DONOR DASHBOARD
// ---------------------------
router.get("/donor-dashboard", protect, authorize("donor"), (req, res) => {
  res.json({
    message: "Welcome to the Donor Dashboard!",
    user: {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// ---------------------------
// ADMIN DASHBOARD
// ---------------------------
router.get("/admin-dashboard", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Welcome to the Admin Dashboard!",
    user: {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

module.exports = router;
