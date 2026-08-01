const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema(
  {
    id: String,
    name: { type: String, required: true },
    serving: String,
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    slot: { type: String, enum: ["Breakfast", "Lunch", "Dinner", "Snack"], required: true },
    time: String,
    items: [foodItemSchema],
  },
  { _id: false }
);

const nutritionLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    meals: [mealSchema],
    water: { type: Number, default: 0 },
    waterTarget: { type: Number, default: 9 },
  },
  { timestamps: true }
);

nutritionLogSchema.index({ user: 1, date: 1 }, { unique: true });

// Virtual: computed totals from meals
nutritionLogSchema.virtual("consumed").get(function () {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const meal of this.meals) {
    for (const item of meal.items) {
      const qty = item.quantity ?? 1;
      calories += item.calories * qty;
      protein += item.protein * qty;
      carbs += item.carbs * qty;
      fat += item.fat * qty;
    }
  }
  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
});

nutritionLogSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("NutritionLog", nutritionLogSchema);
