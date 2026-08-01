const mongoose = require("mongoose");

const routineExerciseSchema = new mongoose.Schema(
  {
    id: String,
    name: { type: String, required: true },
    sets: { type: Number, default: 3 },
    reps: { type: Number, default: 10 },
    muscle: String,
    equipment: String,
  },
  { _id: false }
);

const routineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    exercises: [routineExerciseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Routine", routineSchema);
