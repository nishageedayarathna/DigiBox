const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");


// Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, role, password, confirmPassword } = req.body;

    if (["admin", "gs", "ds"].includes(role)) {
      return res.status(403).json({
        message: "This role cannot be created via signup",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      role,
      password: hashed,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Signup error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({
    token,
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
      areaCode: user.areaCode || null,
    },
  });
});

// POST /api/auth/reset-password

router.put("/reset-password", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // logged-in user
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ message: "Password required" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.mustResetPassword = false; // cleared after reset
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ message: "Server error resetting password" });
  }
});



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
