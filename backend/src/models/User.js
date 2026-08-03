const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    // body stats
    age: { type: Number, default: 25 },
    heightCm: { type: Number, default: 175 },
    weightKg: { type: Number, default: 75 },
    gender: { type: String, enum: ["male", "female", "other"], default: "male" },
    // goals
    goal: {
      type: String,
      enum: ["lean-bulk", "bulk", "cut", "maintenance", "lose-weight"],
      default: "maintenance",
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "high", "athlete"],
      default: "moderate",
    },
    experience: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    targetDays: { type: Number, default: 4 },
    gymAccess: { type: String, enum: ["full-gym", "home-gym", "bodyweight"], default: "full-gym" },
    foodPreferences: [String],
    units: { type: String, enum: ["metric", "imperial"], default: "metric" },
    // gamification
    xp: { type: Number, default: 0 },
    xpToNext: { type: Number, default: 1000 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
