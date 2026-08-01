const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Measurement = require("../models/Measurement");

// GET /api/measurements
router.get("/", protect, async (req, res) => {
  try {
    const records = await Measurement.find({ user: req.user._id });
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/measurements  — create new record
router.post("/", protect, async (req, res) => {
  try {
    const { label, unit } = req.body;
    if (!label) return res.status(400).json({ message: "label is required" });
    const record = await Measurement.create({ user: req.user._id, label, unit: unit || "cm", entries: [] });
    res.status(201).json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/measurements/:id/log  — add entry to record
router.post("/:id/log", protect, async (req, res) => {
  try {
    const { date, value } = req.body;
    if (!date || value == null) return res.status(400).json({ message: "date and value are required" });

    const record = await Measurement.findOne({ _id: req.params.id, user: req.user._id });
    if (!record) return res.status(404).json({ message: "Not found" });

    const existing = record.entries.find((e) => e.date === date);
    if (existing) {
      existing.value = value;
    } else {
      record.entries.push({ date, value });
    }
    await record.save();
    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/measurements/:id  — rename record
router.patch("/:id", protect, async (req, res) => {
  try {
    const record = await Measurement.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { label: req.body.label },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: "Not found" });
    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/measurements/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    await Measurement.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
