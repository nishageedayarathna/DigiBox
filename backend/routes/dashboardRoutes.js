const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ---------------------------
// ADMIN DASHBOARD ROUTE
// ---------------------------
// Only an 'admin' can access this route
router.get("/admin-dashboard", protect, authorize("admin"), (req, res) => {
  // req.user is available here thanks to the 'protect' middleware
  res.json({
    message: "Welcome to the Admin Dashboard!",
    user: {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
    // You'd send actual admin data here
  });
});

// ---------------------------
// DONOR DASHBOARD ROUTE
// ---------------------------
// Only a 'donor' can access this route
router.get("/donor-dashboard", protect, authorize("donor"), (req, res) => {
  res.json({
    message: "Welcome to the Donor Dashboard!",
    user: {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
    // You'd send actual donor data here
  });
});

// ---------------------------
// CREATOR DASHBOARD ROUTE
// ---------------------------
// Only a 'creator' can access this route
router.get("/creator/creator-dashboard", protect, authorize("creator"), (req, res) => {
  res.json({
    message: "Welcome to the Cause Creator Dashboard!",
    user: {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
    },
    // You'd send actual creator data here
  });
});

module.exports = router;