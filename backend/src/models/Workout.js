const mongoose = require("mongoose");

const setEntrySchema = new mongoose.Schema(
  {
    id: String,
    targetReps: Number,
    targetWeight: Number,
    reps: Number,
    weight: Number,
    rpe: Number,
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const exerciseSchema = new mongoose.Schema(
  {
    id: String,
    name: { type: String, required: true },
    muscle: String,
    equipment: String,
    notes: String,
    aiTip: String,
    lastSession: String,
    sets: [setEntrySchema],
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    durationMin: { type: Number, default: 0 },
    exercises: [exerciseSchema],
    notes: { type: String, default: "" },
    volume: { type: Number, default: 0 }, // total kg lifted
    totalSets: { type: Number, default: 0 },
  },
  { timestamps: true }
);

workoutSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model("Workout", workoutSchema);
