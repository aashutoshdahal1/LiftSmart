const router = require("express").Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");

// GET /api/profile
router.get("/", protect, (req, res) => {
  res.json({ profile: req.user });
});

// PATCH /api/profile
router.patch("/", protect, async (req, res) => {
  try {
    const allowed = [
      "name", "age", "heightCm", "weightKg", "gender", "goal",
      "activityLevel", "experience", "targetDays", "gymAccess",
      "foodPreferences", "units",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ profile: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
