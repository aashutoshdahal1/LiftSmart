const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD
    value: { type: Number, required: true },
  },
  { _id: false }
);

const measurementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, required: true },
    unit: { type: String, default: "cm" },
    entries: [entrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Measurement", measurementSchema);
