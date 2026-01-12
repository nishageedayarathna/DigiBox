const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const causeRoutes = require("./routes/causeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const gsRoutes = require("./routes/gsRoutes");
const dsRoutes = require("./routes/dsRoutes");
const User = require("./models/userModel");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();

// Connect to DB and then create admin if not exists
connectDB().then(() => {
  createAdminAccount();
});

// Function to create default admin
async function createAdminAccount() {
  try {
    const adminExists = await User.findOne({ role: "admin" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);

      await User.create({
        username: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("Default admin created: admin@example.com / Admin@123");
    } else {
      console.log("Admin account already exists");
    }
  } catch (error) {
    console.error("Error creating admin account:", error);
  }
}

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST","PUT","DELETE"],
  credentials: true,
}));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/cause", causeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gs", gsRoutes);
app.use("/api/ds", dsRoutes);



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
