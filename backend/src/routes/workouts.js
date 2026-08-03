const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Workout = require("../models/Workout");
const User = require("../models/User");

// GET /api/workouts  — history, most recent first
// ?limit=N (default 20, max 600)  ?summary=1 (omit exercises for chart use)
router.get("/", protect, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 600);
    const summary = req.query.summary === "1";
    const projection = summary ? { exercises: 0 } : {};
    const workouts = await Workout.find({ user: req.user._id }, projection).sort({ date: -1 }).limit(limit);
    res.json({ workouts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/workouts  — save a completed workout
router.post("/", protect, async (req, res) => {
  try {
    const { title, date, durationMin, exercises, notes, volume, totalSets } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const workout = await Workout.create({
      user: req.user._id,
      title,
      date: date || new Date().toISOString().slice(0, 10),
      durationMin: durationMin || 0,
      exercises: exercises || [],
      notes: notes || "",
      volume: volume || 0,
      totalSets: totalSets || 0,
    });

    // Award XP: 50 base + 1 per set
    const xpGain = 50 + (totalSets || 0);
    const user = await User.findById(req.user._id);
    user.xp += xpGain;
    while (user.xp >= user.xpToNext) {
      user.xp -= user.xpToNext;
      user.level += 1;
      user.xpToNext = Math.round(user.xpToNext * 1.15);
    }
    // Update streak
    const today = new Date().toISOString().slice(0, 10);
    if (user.lastActiveDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yd = yesterday.toISOString().slice(0, 10);
      user.streak = user.lastActiveDate === yd ? user.streak + 1 : 1;
      user.lastActiveDate = today;
    }
    await user.save();

    res.status(201).json({ workout, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/workouts/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    await Workout.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
