const router = require("express").Router();
const { protect } = require("../middleware/auth");
const WeightEntry = require("../models/WeightEntry");

// GET /api/weight  — all entries for logged-in user, sorted by date asc
router.get("/", protect, async (req, res) => {
  try {
    const entries = await WeightEntry.find({ user: req.user._id }).sort({ date: 1 });
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/weight  — upsert by date
router.post("/", protect, async (req, res) => {
  try {
    const { date, kg } = req.body;
    if (!date || kg == null) return res.status(400).json({ message: "date and kg are required" });

    const entry = await WeightEntry.findOneAndUpdate(
      { user: req.user._id, date },
      { kg },
      { upsert: true, new: true }
    );
    res.json({ entry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/weight/:date
router.delete("/:date", protect, async (req, res) => {
  try {
    await WeightEntry.findOneAndDelete({ user: req.user._id, date: req.params.date });
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
