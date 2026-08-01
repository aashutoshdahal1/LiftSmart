const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "30d" });
}

module.exports = { protect, signToken };
