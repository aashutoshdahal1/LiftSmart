require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./lib/db");

const app = express();

const ALLOWED_ORIGINS = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server / curl (no origin) and listed origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/weight", require("./routes/weight"));
app.use("/api/nutrition", require("./routes/nutrition"));
app.use("/api/workouts", require("./routes/workouts"));
app.use("/api/routines", require("./routes/routines"));
app.use("/api/measurements", require("./routes/measurements"));
app.use("/api/ai", require("./routes/ai"));

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`LiftSmart API running on port ${PORT}`));
}).catch((err) => {
  console.error("DB connection failed:", err.message);
  process.exit(1);
});
