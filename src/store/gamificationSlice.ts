import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { user } from "@/lib/mock-data";

interface GamificationState {
  xp: number;
  xpToNext: number;
  level: number;
  streak: number;
  celebration: string | null;
}

const initialState: GamificationState = {
  xp: user.xp,
  xpToNext: user.xpToNext,
  level: user.level,
  streak: user.streak,
  celebration: null,
};

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    awardXp(state, action: PayloadAction<number>) {
      state.xp += action.payload;
      while (state.xp >= state.xpToNext) {
        state.xp -= state.xpToNext;
        state.level += 1;
        state.xpToNext = Math.round(state.xpToNext * 1.15);
      }
    },
    celebrate(state, action: PayloadAction<string>) {
      state.celebration = action.payload;
    },
    clearCelebration(state) {
      state.celebration = null;
    },
    incrementStreak(state) {
      state.streak += 1;
    },
  },
});

export const { awardXp, celebrate, clearCelebration, incrementStreak } = gamificationSlice.actions;
export default gamificationSlice.reducer;
