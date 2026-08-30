const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "icompro_telemedicine_super_jwt_secret_2026";

/**
 * Protect routes: verifies JWT bearer token and sets req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Not authorized, user account not found."
        });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error("JWT Verification Failed:", err.message);
      return res.status(401).json({
        success: false,
        error: "Not authorized, invalid or expired token."
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Not authorized, access token is missing."
    });
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : "unauthenticated"}' is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
