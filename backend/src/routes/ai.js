const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { chatCompletion } = require("../lib/groq");
const WeightEntry = require("../models/WeightEntry");
const NutritionLog = require("../models/NutritionLog");
const Workout = require("../models/Workout");

function buildSystemPrompt(user, context) {
  return `You are LiftSmart AI Coach — a concise, evidence-based fitness and nutrition coach.

User profile:
- Name: ${user.name}
- Age: ${user.age}, Gender: ${user.gender}
- Height: ${user.heightCm}cm, Weight: ${user.weightKg}kg
- Goal: ${user.goal}, Activity level: ${user.activityLevel}
- Experience: ${user.experience}, Gym access: ${user.gymAccess}
- Target training days/week: ${user.targetDays}

${context}

Rules:
- Be direct and specific. No fluff.
- Keep replies under 200 words unless the user asks for more detail.
- Use metric units unless user prefers imperial.
- When suggesting foods, consider: ${user.foodPreferences?.join(", ") || "no specific preferences"}.
- Always ground advice in the user's actual data when available.`;
}

// POST /api/ai/chat  — freeform AI coach chat
router.post("/chat", protect, async (req, res) => {
  try {
    const { messages, page } = req.body;
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ message: "messages array is required" });

    // Pull relevant context
    const [recentWeights, todayLog, recentWorkouts] = await Promise.all([
      WeightEntry.find({ user: req.user._id }).sort({ date: -1 }).limit(7),
      NutritionLog.findOne({ user: req.user._id, date: new Date().toISOString().slice(0, 10) }),
      Workout.find({ user: req.user._id }).sort({ date: -1 }).limit(3),
    ]);

    const weightStr = recentWeights.length
      ? `Recent weight: ${recentWeights.map((w) => `${w.date}: ${w.kg}kg`).join(", ")}`
      : "No weight entries logged yet.";

    const nutritionStr = todayLog
      ? `Today's nutrition: ${JSON.stringify(todayLog.consumed)} / water: ${todayLog.water} glasses`
      : "No food logged today.";

    const workoutStr = recentWorkouts.length
      ? `Recent workouts: ${recentWorkouts.map((w) => `${w.date} - ${w.title} (${w.volume}kg volume)`).join("; ")}`
      : "No recent workouts.";

    const context = [weightStr, nutritionStr, workoutStr].join("\n");
    const systemPrompt = buildSystemPrompt(req.user, context);

    const reply = await chatCompletion(
      [{ role: "system", content: systemPrompt }, ...messages],
      { maxTokens: 512 }
    );

    res.json({ reply });
  } catch (err) {
    console.error("[ai/chat]", err.message);
    res.status(500).json({ message: "AI service error" });
  }
});

// POST /api/ai/suggestions  — page-specific proactive suggestions
router.post("/suggestions", protect, async (req, res) => {
  try {
    const { page } = req.body; // "workout" | "food" | "progress"

    const [recentWeights, todayLog, recentWorkouts] = await Promise.all([
      WeightEntry.find({ user: req.user._id }).sort({ date: -1 }).limit(14),
      NutritionLog.findOne({ user: req.user._id, date: new Date().toISOString().slice(0, 10) }),
      Workout.find({ user: req.user._id }).sort({ date: -1 }).limit(5),
    ]);

    const weightStr = recentWeights.map((w) => `${w.date}: ${w.kg}kg`).join(", ") || "none";
    const consumed = todayLog?.consumed ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const workoutStr = recentWorkouts.map((w) => `${w.date}: ${w.title}, ${w.volume}kg`).join("; ") || "none";

    const pagePrompts = {
      workout: `Based on the user's recent workouts (${workoutStr}), generate 3 short, specific training suggestions. Consider muscle recovery, progression, and their goal (${req.user.goal}).`,
      food: `Based on today's nutrition (calories: ${consumed.calories}, protein: ${consumed.protein}g, carbs: ${consumed.carbs}g, fat: ${consumed.fat}g) and weight trend (${weightStr}), give 3 specific food/meal suggestions to hit targets for their goal (${req.user.goal}).`,
      progress: `Based on weight trend (${weightStr}) and workout history (${workoutStr}), give 3 insights about the user's progress toward their goal (${req.user.goal}).`,
    };

    const prompt = pagePrompts[page] || pagePrompts.workout;
    const systemPrompt = buildSystemPrompt(req.user, "");

    const reply = await chatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt + "\n\nReturn a JSON array of 3 objects: [{title, body, tag}] where tag is one of: 'nutrition', 'training', 'recovery', 'progress'. Reply ONLY with valid JSON, no markdown." },
    ], { temperature: 0.6, maxTokens: 512 });

    let suggestions;
    try {
      suggestions = JSON.parse(reply);
    } catch {
      // fallback if model adds markdown
      const match = reply.match(/\[[\s\S]*\]/);
      suggestions = match ? JSON.parse(match[0]) : [];
    }

    res.json({ suggestions });
  } catch (err) {
    console.error("[ai/suggestions]", err.message);
    res.status(500).json({ message: "AI service error" });
  }
});

// POST /api/ai/workout-plan  — generate a workout routine
router.post("/workout-plan", protect, async (req, res) => {
  try {
    const { focus, equipment } = req.body;

    const prompt = `Generate a single workout routine for:
- Goal: ${req.user.goal}
- Experience: ${req.user.experience}
- Equipment: ${equipment || req.user.gymAccess}
- Focus: ${focus || "full body"}
- Days/week target: ${req.user.targetDays}

Return ONLY valid JSON in this shape:
{
  "title": "string",
  "exercises": [
    { "name": "string", "sets": number, "reps": number, "muscle": "string", "equipment": "string" }
  ]
}
No markdown, no explanation.`;

    const reply = await chatCompletion([
      { role: "user", content: prompt },
    ], { temperature: 0.5, maxTokens: 768 });

    let plan;
    try {
      plan = JSON.parse(reply);
    } catch {
      const match = reply.match(/\{[\s\S]*\}/);
      plan = match ? JSON.parse(match[0]) : null;
    }

    if (!plan) return res.status(500).json({ message: "Could not parse workout plan" });
    res.json({ plan });
  } catch (err) {
    console.error("[ai/workout-plan]", err.message);
    res.status(500).json({ message: "AI service error" });
  }
});

// POST /api/ai/meal-plan  — generate daily meal suggestions
router.post("/meal-plan", protect, async (req, res) => {
  try {
    const { targetCalories, targetProtein } = req.body;

    const prompt = `Create a full day meal plan for:
- Calorie target: ${targetCalories} kcal
- Protein target: ${targetProtein}g
- Food preferences: ${req.user.foodPreferences?.join(", ") || "none"}
- Goal: ${req.user.goal}

Return ONLY valid JSON:
{
  "meals": [
    {
      "slot": "Breakfast" | "Lunch" | "Dinner" | "Snack",
      "items": [{ "name": "string", "serving": "string", "calories": number, "protein": number, "carbs": number, "fat": number }]
    }
  ]
}`;

    const reply = await chatCompletion([
      { role: "user", content: prompt },
    ], { temperature: 0.6, maxTokens: 1024 });

    let mealPlan;
    try {
      mealPlan = JSON.parse(reply);
    } catch {
      const match = reply.match(/\{[\s\S]*\}/);
      mealPlan = match ? JSON.parse(match[0]) : null;
    }

    if (!mealPlan) return res.status(500).json({ message: "Could not parse meal plan" });
    res.json(mealPlan);
  } catch (err) {
    console.error("[ai/meal-plan]", err.message);
    res.status(500).json({ message: "AI service error" });
  }
});

module.exports = router;
