const router = require("express").Router();
const { protect } = require("../middleware/auth");
const NutritionLog = require("../models/NutritionLog");

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// GET /api/nutrition?date=YYYY-MM-DD  — get log for a date (default today)
router.get("/", protect, async (req, res) => {
  try {
    const date = req.query.date || todayStr();
    let log = await NutritionLog.findOne({ user: req.user._id, date });

    // No log for this date — create a fresh empty one
    if (!log) {
      log = await NutritionLog.create({
        user: req.user._id,
        date,
        meals: [
          { slot: "Breakfast", time: "8:00 AM",  items: [] },
          { slot: "Lunch",     time: "12:30 PM", items: [] },
          { slot: "Snack",     time: "3:30 PM",  items: [] },
          { slot: "Dinner",    time: "7:00 PM",  items: [] },
        ],
        water: 0,
        waterTarget: 9,
      });
    }

    res.json({ log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/nutrition/food  — add food item to a meal slot
router.post("/food", protect, async (req, res) => {
  try {
    const { date, slot, item } = req.body;
    if (!slot || !item) return res.status(400).json({ message: "slot and item are required" });

    const d = date || todayStr();
    const log = await NutritionLog.findOne({ user: req.user._id, date: d });
    if (!log) return res.status(404).json({ message: "No log for this date" });

    const meal = log.meals.find((m) => m.slot === slot);
    if (!meal) return res.status(404).json({ message: "Meal slot not found" });

    meal.items.push(item);
    await log.save();
    res.json({ log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/nutrition/food  — remove food item from a meal slot
router.delete("/food", protect, async (req, res) => {
  try {
    const { date, slot, itemId } = req.body;
    const d = date || todayStr();
    const log = await NutritionLog.findOne({ user: req.user._id, date: d });
    if (!log) return res.status(404).json({ message: "No log for this date" });

    const meal = log.meals.find((m) => m.slot === slot);
    if (!meal) return res.status(404).json({ message: "Meal slot not found" });

    meal.items = meal.items.filter((i) => i.id !== itemId);
    await log.save();
    res.json({ log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/nutrition/history?days=7  — last N days of calorie + protein totals
router.get("/history", protect, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 30);
    const results = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const date = d.toISOString().slice(0, 10);
      const log = await NutritionLog.findOne({ user: req.user._id, date });
      const items = log ? log.meals.flatMap((m) => m.items) : [];
      results.push({
        date,
        calories: Math.round(items.reduce((s, it) => s + it.calories * (it.quantity ?? 1), 0)),
        protein:  Math.round(items.reduce((s, it) => s + it.protein  * (it.quantity ?? 1), 0)),
      });
    }
    res.json({ history: results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/nutrition/water  — set water count
router.patch("/water", protect, async (req, res) => {
  try {
    const { date, water } = req.body;
    const d = date || todayStr();
    const log = await NutritionLog.findOneAndUpdate(
      { user: req.user._id, date: d },
      { water },
      { new: true }
    );
    res.json({ log });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
