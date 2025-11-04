const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to protect routes (checks for a valid token)
const protect = async (req, res, next) => {
  let token;

  // 1. Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (it comes as 'Bearer TOKEN')
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user to the request object (excluding the password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Move to the next middleware or the route handler
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// Middleware to authorize users by role
const authorize = (roles = []) => {
  // roles can be a single role (e.g., "admin") or an array (e.g., ["admin", "creator"])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };