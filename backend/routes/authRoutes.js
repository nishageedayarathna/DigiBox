const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const sendEmail = require("../utils/email");

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

    // Send welcome email asynchronously
    setImmediate(async () => {
      try {
        const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to DigiBox!</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #26bfef, #0a6c8b); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 10px 10px; }
    .welcome-message { background: white; padding: 30px; border-radius: 8px; border-left: 4px solid #26bfef; margin: 20px 0; }
    .role-badge { display: inline-block; background: #26bfef; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; }
    .cta-button { display: inline-block; background: #26bfef; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to DigiBox!</h1>
      <p>Your journey to making a difference starts here</p>
    </div>

    <div class="content">
      <div class="welcome-message">
        <h2>Hello <strong>${username}</strong>!</h2>
        <p>Welcome to the DigiBox Donation Platform! We're thrilled to have you join our community of changemakers.</p>

        <p><strong>Your Role:</strong> <span class="role-badge">${role.toUpperCase()}</span></p>

        <p>As a ${role}, you can:</p>
        <ul>
          ${role === 'donor' ?
            `<li>💝 Browse and support meaningful causes</li>
             <li>📊 Track your donation impact</li>
             <li>🏆 Earn badges for your generosity</li>` :
            `<li>📝 Create and manage donation causes</li>
             <li>📈 Track fundraising progress</li>
             <li>📊 View detailed analytics</li>`
          }
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:3000/login" class="cta-button">Get Started Now →</a>
      </div>

      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>

      <div class="footer">
        <p>Best regards,<br><strong>DigiBox Team</strong></p>
        <p style="margin-top: 20px; font-size: 12px; color: #999;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

        await sendEmail(
          email,
          "🎉 Welcome to DigiBox - Your Account is Ready!",
          `Hello ${username},\n\nWelcome to DigiBox! Your ${role} account has been created successfully.\n\nYou can now log in and start making a difference in our community.\n\nBest regards,\nDigiBox Team`,
          welcomeHtml
        );
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Note: We don't fail registration if email fails
      }
    });

    res.status(201).json({ message: "User registered successfully. Welcome email sent!" });
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
