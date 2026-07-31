export type Goal = "lean-bulk" | "cut" | "bulk" | "maintenance";

export interface UserProfile {
  name: string;
  email: string;
  avatarInitials: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: "male" | "female" | "other";
  goal: Goal;
  activityLevel: "sedentary" | "light" | "moderate" | "high" | "athlete";
  experience: "beginner" | "intermediate" | "advanced";
  targetDays: number;
  gymAccess: "full-gym" | "home-gym" | "bodyweight";
  foodPreferences: string[];
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  units: "metric" | "imperial";
}

export const user: UserProfile = {
  name: "Alex Rivera",
  email: "alex@liftsmart.fit",
  avatarInitials: "AR",
  age: 28,
  heightCm: 181,
  weightKg: 78.4,
  gender: "male",
  goal: "lean-bulk",
  activityLevel: "high",
  experience: "intermediate",
  targetDays: 5,
  gymAccess: "full-gym",
  foodPreferences: ["High protein", "No shellfish"],
  level: 14,
  xp: 2340,
  xpToNext: 3000,
  streak: 23,
  units: "metric",
};

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const targets: MacroTargets = { calories: 2980, protein: 185, carbs: 340, fat: 88 };
export const consumed: MacroTargets = { calories: 2145, protein: 152, carbs: 226, fat: 61 };

export const waterGlasses = { current: 6, target: 9 };

export interface SetEntry {
  id: string;
  targetReps: number;
  targetWeight: number;
  reps?: number;
  weight?: number;
  rpe?: number;
  done: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  notes?: string;
  aiTip: string;
  lastSession: string;
  sets: SetEntry[];
}

const mkSets = (count: number, reps: number, weight: number): SetEntry[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `s${i}`,
    targetReps: reps,
    targetWeight: weight,
    done: false,
  }));

export const todayWorkout = {
  title: "Upper Body — Push Focus",
  subtitle: "Week 6 · Progressive Overload Block",
  durationMin: 62,
  volumeKg: 9840,
  intensity: "Moderate–High",
  exercises: [
    {
      id: "e1",
      name: "Barbell Bench Press",
      muscle: "Chest",
      equipment: "Barbell",
      aiTip: "You hit 4×8 @ 82.5kg at RPE 7. Add 2.5kg today — you have room.",
      lastSession: "4 × 8 @ 82.5 kg",
      sets: mkSets(4, 8, 85),
    },
    {
      id: "e2",
      name: "Incline Dumbbell Press",
      muscle: "Chest",
      equipment: "Dumbbells",
      aiTip: "Keep reps in the 10–12 range. Focus on a slow 3s eccentric.",
      lastSession: "3 × 11 @ 30 kg",
      sets: mkSets(3, 11, 30),
    },
    {
      id: "e3",
      name: "Seated Overhead Press",
      muscle: "Shoulders",
      equipment: "Barbell",
      aiTip: "Stalled 2 weeks — dropping to 5×5 to rebuild pressing strength.",
      lastSession: "5 × 5 @ 52.5 kg",
      sets: mkSets(5, 5, 52.5),
    },
    {
      id: "e4",
      name: "Cable Lateral Raise",
      muscle: "Shoulders",
      equipment: "Cable",
      aiTip: "Great mind-muscle connection last week. Same load, +1 rep.",
      lastSession: "3 × 14 @ 9 kg",
      sets: mkSets(3, 15, 9),
    },
    {
      id: "e5",
      name: "Overhead Triceps Extension",
      muscle: "Triceps",
      equipment: "Cable",
      aiTip: "Finisher — take the last set to technical failure.",
      lastSession: "3 × 12 @ 25 kg",
      sets: mkSets(3, 12, 27.5),
    },
  ] as Exercise[],
};

export interface FoodItem {
  id: string;
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  slot: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  time: string;
  items: FoodItem[];
}

export const meals: Meal[] = [
  {
    id: "m1",
    slot: "Breakfast",
    time: "07:40",
    items: [
      {
        id: "f1",
        name: "Greek yogurt & berries",
        serving: "300 g",
        calories: 280,
        protein: 28,
        carbs: 26,
        fat: 6,
      },
      {
        id: "f2",
        name: "Oats with honey",
        serving: "80 g",
        calories: 340,
        protein: 11,
        carbs: 58,
        fat: 7,
      },
    ],
  },
  {
    id: "m2",
    slot: "Lunch",
    time: "12:55",
    items: [
      {
        id: "f3",
        name: "Grilled chicken & rice bowl",
        serving: "1 bowl",
        calories: 690,
        protein: 55,
        carbs: 78,
        fat: 15,
      },
      { id: "f4", name: "Avocado", serving: "½", calories: 160, protein: 2, carbs: 8, fat: 14 },
    ],
  },
  {
    id: "m3",
    slot: "Snack",
    time: "16:20",
    items: [
      {
        id: "f5",
        name: "Whey protein shake",
        serving: "1 scoop",
        calories: 130,
        protein: 27,
        carbs: 3,
        fat: 1,
      },
      {
        id: "f6",
        name: "Banana",
        serving: "1 medium",
        calories: 105,
        protein: 1,
        carbs: 27,
        fat: 0,
      },
    ],
  },
  {
    id: "m4",
    slot: "Dinner",
    time: "20:10",
    items: [
      {
        id: "f7",
        name: "Salmon, potatoes & greens",
        serving: "1 plate",
        calories: 440,
        protein: 38,
        carbs: 26,
        fat: 18,
      },
    ],
  },
];

export const favoriteMeals: FoodItem[] = [
  {
    id: "fav1",
    name: "Steak & sweet potato",
    serving: "1 plate",
    calories: 620,
    protein: 48,
    carbs: 44,
    fat: 24,
  },
  {
    id: "fav2",
    name: "Protein oats",
    serving: "1 bowl",
    calories: 410,
    protein: 34,
    carbs: 52,
    fat: 8,
  },
  {
    id: "fav3",
    name: "Chicken wrap",
    serving: "1 wrap",
    calories: 520,
    protein: 42,
    carbs: 48,
    fat: 16,
  },
  {
    id: "fav4",
    name: "Cottage cheese bowl",
    serving: "250 g",
    calories: 240,
    protein: 32,
    carbs: 12,
    fat: 6,
  },
];

export const foodSearchResults: FoodItem[] = [
  {
    id: "sr1",
    name: "Chicken breast, grilled",
    serving: "100 g",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
  },
  {
    id: "sr2",
    name: "Basmati rice, cooked",
    serving: "100 g",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
  },
  {
    id: "sr3",
    name: "Whole eggs",
    serving: "2 large",
    calories: 143,
    protein: 12.6,
    carbs: 1,
    fat: 9.5,
  },
  {
    id: "sr4",
    name: "Almonds",
    serving: "30 g",
    calories: 174,
    protein: 6.4,
    carbs: 6,
    fat: 15,
  },
  {
    id: "sr5",
    name: "Skyr, natural",
    serving: "200 g",
    calories: 128,
    protein: 22,
    carbs: 8,
    fat: 0.4,
  },
];

export const weightSeries = [
  { date: "Jun 01", weight: 80.9, avg: 81.1 },
  { date: "Jun 08", weight: 80.4, avg: 80.7 },
  { date: "Jun 15", weight: 80.1, avg: 80.3 },
  { date: "Jun 22", weight: 79.6, avg: 79.9 },
  { date: "Jun 29", weight: 79.5, avg: 79.6 },
  { date: "Jul 06", weight: 79.0, avg: 79.2 },
  { date: "Jul 13", weight: 78.9, avg: 78.9 },
  { date: "Jul 20", weight: 78.5, avg: 78.7 },
  { date: "Jul 27", weight: 78.4, avg: 78.5 },
];

export const calorieSeries = [
  { day: "Mon", calories: 2890, target: 2980 },
  { day: "Tue", calories: 3050, target: 2980 },
  { day: "Wed", calories: 2760, target: 2980 },
  { day: "Thu", calories: 3010, target: 2980 },
  { day: "Fri", calories: 2940, target: 2980 },
  { day: "Sat", calories: 3210, target: 2980 },
  { day: "Sun", calories: 2145, target: 2980 },
];

export const proteinSeries = [
  { day: "Mon", protein: 188 },
  { day: "Tue", protein: 196 },
  { day: "Wed", protein: 172 },
  { day: "Thu", protein: 191 },
  { day: "Fri", protein: 184 },
  { day: "Sat", protein: 203 },
  { day: "Sun", protein: 152 },
];

export const strengthSeries = [
  { week: "W1", bench: 75, squat: 120, deadlift: 145 },
  { week: "W2", bench: 77.5, squat: 122.5, deadlift: 150 },
  { week: "W3", bench: 77.5, squat: 127.5, deadlift: 152.5 },
  { week: "W4", bench: 80, squat: 130, deadlift: 157.5 },
  { week: "W5", bench: 82.5, squat: 132.5, deadlift: 160 },
  { week: "W6", bench: 85, squat: 137.5, deadlift: 165 },
];

export const volumeSeries = [
  { week: "W1", volume: 42000 },
  { week: "W2", volume: 45600 },
  { week: "W3", volume: 44100 },
  { week: "W4", volume: 49800 },
  { week: "W5", volume: 52400 },
  { week: "W6", volume: 56100 },
];

export const consistencySeries = [
  { week: "W1", sessions: 4 },
  { week: "W2", sessions: 5 },
  { week: "W3", sessions: 3 },
  { week: "W4", sessions: 5 },
  { week: "W5", sessions: 5 },
  { week: "W6", sessions: 4 },
];

export const measurements = [
  { label: "Chest", value: "106 cm", delta: "+1.4" },
  { label: "Waist", value: "80 cm", delta: "-2.1" },
  { label: "Arms", value: "38.5 cm", delta: "+0.9" },
  { label: "Thighs", value: "61 cm", delta: "+1.1" },
  { label: "Shoulders", value: "126 cm", delta: "+1.8" },
  { label: "Calves", value: "39 cm", delta: "+0.4" },
];

export const achievements = [
  { id: "a1", name: "Iron Habit", desc: "20-day streak", icon: "flame", unlocked: true },
  { id: "a2", name: "Protein Machine", desc: "Hit protein 30 days", icon: "beef", unlocked: true },
  { id: "a3", name: "Bench Boss", desc: "Bench 1.1× bodyweight", icon: "dumbbell", unlocked: true },
  { id: "a4", name: "Early Riser", desc: "10 workouts before 7am", icon: "sunrise", unlocked: true },
  { id: "a5", name: "Volume King", desc: "60,000 kg in a week", icon: "trending-up", unlocked: false },
  { id: "a6", name: "Century", desc: "100 workouts logged", icon: "trophy", unlocked: false },
];

export const missions = [
  { id: "w1", label: "Train 5 days this week", progress: 4, total: 5, xp: 250 },
  { id: "w2", label: "Log protein every day", progress: 6, total: 7, xp: 200 },
  { id: "w3", label: "Drink 9 glasses × 5 days", progress: 3, total: 5, xp: 120 },
  { id: "w4", label: "Beat one personal record", progress: 1, total: 1, xp: 300 },
];

export const scores = [
  { label: "Consistency", value: 92, tone: "primary" as const },
  { label: "Recovery", value: 78, tone: "accent" as const },
  { label: "Nutrition", value: 85, tone: "success" as const },
  { label: "Workout", value: 88, tone: "warning" as const },
];

export const aiInsights = [
  {
    id: "i1",
    title: "Push day intensity is dialled in",
    body: "Your bench RPE dropped from 8.5 to 7 at the same load. Adding 2.5 kg today keeps you in the hypertrophy sweet spot.",
    tag: "Progressive Overload",
  },
  {
    id: "i2",
    title: "Calories trending 180 under target",
    body: "You've averaged 2,800 kcal over 7 days on a lean-bulk. I've nudged your dinner suggestion up by one carb serving.",
    tag: "Calorie Adjustment",
  },
  {
    id: "i3",
    title: "Overhead press plateau detected",
    body: "No load increase in 3 weeks. Switching to a 5×5 wave for two weeks should break the stall.",
    tag: "Plateau Detection",
  },
  {
    id: "i4",
    title: "Recovery dipping on Thursdays",
    body: "Sleep averages 6h02 before Thursday sessions. Shifting legs to Friday should lift output ~7%.",
    tag: "Recovery",
  },
];

export const chatMessages = [
  {
    id: "c1",
    role: "assistant" as const,
    text: "Morning Alex. You're on a 23-day streak and up 1.9 kg with the waist down 2 cm — textbook lean bulk. Today is Upper Push. Want me to walk through the plan?",
  },
  { id: "c2", role: "user" as const, text: "My shoulders feel a bit beat up. Should I still press?" },
  {
    id: "c3",
    role: "assistant" as const,
    text: "Let's adjust rather than skip. Keep the bench at 4×8 @ 85 kg, but swap the seated barbell press for a neutral-grip dumbbell press at 3×10 with RPE capped at 7. I'll also add band pull-aparts between sets for scapular health. Volume stays within 5% of plan, so your progression is safe.",
  },
  {
    id: "c4",
    role: "user" as const,
    text: "Sounds good. And what about protein today?",
  },
  {
    id: "c5",
    role: "assistant" as const,
    text: "You're at 152 g of 185 g. A 250 g skyr bowl post-workout plus your salmon dinner lands you at 192 g — just over target, which is ideal on a training day.",
  },
];

export const coachPrompts = [
  "Review my last week",
  "Adjust my calories",
  "Why is my bench stalling?",
  "Build a deload week",
  "Best post-workout meal?",
];

export const testimonials = [
  {
    name: "Maya Chen",
    role: "Down 11 kg in 5 months",
    quote:
      "It reads my logs better than my old trainer did. The weekly review alone is worth the subscription.",
  },
  {
    name: "Daniel Okafor",
    role: "+14 kg on bench in 12 weeks",
    quote:
      "The progressive overload suggestions are scary accurate. I just show up and lift what it tells me.",
  },
  {
    name: "Sofia Marín",
    role: "Training 4× a week for a year",
    quote:
      "The streaks and missions got me consistent for the first time in my life. I open it every morning.",
  },
];

export const pricing = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    features: ["Workout & food logging", "Weight trend graph", "Streaks and XP", "1 AI check-in / week"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    features: [
      "Unlimited AI coaching",
      "Daily adaptive programming",
      "Progressive overload engine",
      "Plateau detection & deloads",
      "Recovery & nutrition scores",
      "Progress photos & measurements",
    ],
    cta: "Start 7-day trial",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "$29",
    period: "/month",
    features: [
      "Everything in Pro",
      "Monthly human coach review",
      "Custom meal plans",
      "Competition prep blocks",
      "Priority support",
    ],
    cta: "Go Elite",
    highlighted: false,
  },
];

export const faqs = [
  {
    q: "How is this different from a normal workout tracker?",
    a: "Trackers store what you did. LiftSmart reads your logs every night and rewrites tomorrow — loads, volume, calories and recovery — so you never have to guess what progression looks like.",
  },
  {
    q: "Do I need a gym?",
    a: "No. During onboarding you choose full gym, home gym or bodyweight, and every program is generated around the equipment you actually have.",
  },
  {
    q: "How accurate is the nutrition coaching?",
    a: "Targets start from your metrics and activity, then adapt weekly using your real weight trend rather than a fixed formula — the same way an experienced coach adjusts.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. LiftSmart installs to your home screen, and workouts and meals you log without signal sync automatically the moment you're back online.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime, in two taps from Settings. Your data stays exportable forever.",
  },
];
