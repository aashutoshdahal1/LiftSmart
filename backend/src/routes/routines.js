const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Routine = require("../models/Routine");

// GET /api/routines
router.get("/", protect, async (req, res) => {
  try {
    const routines = await Routine.find({ user: req.user._id }).sort({ sortOrder: 1, createdAt: 1 });
    res.json({ routines });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/routines
router.post("/", protect, async (req, res) => {
  try {
    const { title, exercises } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });
    const routine = await Routine.create({ user: req.user._id, title, exercises: exercises || [] });
    res.status(201).json({ routine });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/routines/reorder  — body: { ids: ["id1","id2",...] }
// Must be before /:id so Express doesn't treat "reorder" as an id
router.put("/reorder", protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ message: "ids must be an array" });
    await Promise.all(
      ids.map((id, index) =>
        Routine.updateOne({ _id: id, user: req.user._id }, { sortOrder: index })
      )
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/routines/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const routine = await Routine.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!routine) return res.status(404).json({ message: "Not found" });
    res.json({ routine });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/routines/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    await Routine.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
