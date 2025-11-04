const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const router = express.Router();

// Register
router.post("/signup", async (req, res) => {
  try {
    const { username, email, role, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, role, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login
// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body; // ✅ changed from username → email
    const user = await User.findOne({ email }); // ✅ changed from username → email

    if (!user) return res.status(400).json({ message: "User not found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password!" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Redirect path based on role
    let dashboard = "";
    if (user.role === "admin") dashboard = "/admin/admin-dashboard";
    if (user.role === "donor") dashboard = "/donor/donor-dashboard";
    if (user.role === "creator") dashboard = "/creator/creator-dashboard";

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        name: user.username, // ✅ send name for frontend
        email: user.email,
        role: user.role,
      },
      redirect: dashboard,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});


module.exports = router;
