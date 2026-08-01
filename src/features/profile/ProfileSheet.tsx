import { AnimatePresence, motion } from "framer-motion";
import { Check, Target, Activity, X, Zap, TrendingDown, Scale, Minus, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/common/SectionHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  computeTargets,
  setActivityLevel,
  setBodyStats,
  setGoal,
  type FitnessGoal,
  type ProfileState,
} from "@/store/profileSlice";
import { user } from "@/lib/mock-data";
import { profileApi } from "@/lib/api";
import { logout } from "@/store/authSlice";

const GOALS: { value: FitnessGoal; label: string; desc: string; icon: typeof Target }[] = [
  { value: "lean-bulk",    label: "Lean Bulk",   desc: "Gain muscle with minimal fat",     icon: Zap },
  { value: "bulk",         label: "Bulk",         desc: "Maximise muscle and strength",     icon: Activity },
  { value: "cut",          label: "Cut",          desc: "Lose fat, keep muscle",            icon: TrendingDown },
  { value: "maintenance",  label: "Maintain",     desc: "Keep current body composition",    icon: Minus },
  { value: "lose-weight",  label: "Lose Weight",  desc: "Reduce overall body weight",       icon: Scale },
];

const ACTIVITY: { value: ProfileState["activityLevel"]; label: string; desc: string }[] = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "light",     label: "Light",     desc: "1–3 days / week" },
  { value: "moderate",  label: "Moderate",  desc: "3–5 days / week" },
  { value: "high",      label: "High",      desc: "6–7 days / week" },
  { value: "athlete",   label: "Athlete",   desc: "Twice daily / physical job" },
];

function Row({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof Target;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function ProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.profile);
  const [age, setAge] = useState(String(profile.age));
  const [height, setHeight] = useState(String(profile.heightCm));
  const [weight, setWeight] = useState(String(profile.weightKg));
  const [saved, setSaved] = useState(false);

  // Compute targets live from form inputs — updates as user types
  const liveProfile: ProfileState = {
    ...profile,
    age: Math.max(10, parseInt(age) || profile.age),
    heightCm: Math.max(100, parseFloat(height) || profile.heightCm),
    weightKg: Math.max(30, parseFloat(weight) || profile.weightKg),
  };
  const targets = computeTargets(liveProfile);

  useEffect(() => {
    setAge(String(profile.age));
    setHeight(String(profile.heightCm));
    setWeight(String(profile.weightKg));
  }, [profile.age, profile.heightCm, profile.weightKg]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function save() {
    const parsed = {
      age: Math.max(10, Math.min(100, parseInt(age) || profile.age)),
      heightCm: Math.max(100, Math.min(250, parseFloat(height) || profile.heightCm)),
      weightKg: Math.max(30, Math.min(300, parseFloat(weight) || profile.weightKg)),
    };
    dispatch(setBodyStats(parsed));
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
    profileApi.update({ ...parsed, goal: profile.goal, activityLevel: profile.activityLevel, gender: profile.gender }).catch(() => {});
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[71] flex max-h-[92dvh] flex-col rounded-t-3xl bg-card"
          >
            <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-muted" />

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-5 py-4 border-b border-border/60">
              <p className="font-display text-base font-bold">Profile & Goals</p>
              <button onClick={onClose} className="grid size-8 place-items-center rounded-2xl bg-elevated text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl space-y-6 p-5">

                {/* Profile card */}
                <div className="surface-card rounded-3xl p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16 border border-border">
                      <AvatarFallback className="bg-elevated font-display text-lg font-semibold">
                        {user.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-display text-lg font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
                    <div>
                      <Label htmlFor="p-age">Age</Label>
                      <Input
                        id="p-age" type="number" inputMode="numeric" value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="mt-2 h-11 rounded-2xl bg-elevated text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-height">Height (cm)</Label>
                      <Input
                        id="p-height" type="number" inputMode="decimal" value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="mt-2 h-11 rounded-2xl bg-elevated text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="p-weight">Weight (kg)</Label>
                      <Input
                        id="p-weight" type="number" inputMode="decimal" value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="mt-2 h-11 rounded-2xl bg-elevated text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <div className="mt-2 flex h-11 gap-1.5">
                        {(["male", "female"] as const).map((g) => (
                          <button
                            key={g}
                            onClick={() => dispatch(setBodyStats({ gender: g }))}
                            className={`flex-1 rounded-2xl text-xs font-semibold capitalize transition-colors ${
                              profile.gender === g
                                ? "bg-primary text-primary-foreground"
                                : "bg-elevated text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={save}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all ${
                      saved ? "bg-emerald-500/15 text-emerald-500" : "bg-primary/12 text-primary hover:bg-primary/20"
                    }`}
                  >
                    {saved ? <><Check className="size-4" /> Saved!</> : "Save body stats"}
                  </button>
                </div>

                {/* Targets preview */}
                <div className="rounded-3xl gradient-primary p-5 text-primary-foreground">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75 mb-3">
                    Daily targets · {GOALS.find((g) => g.value === profile.goal)?.label}
                  </p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Calories", val: targets.calories.toLocaleString(), unit: "kcal" },
                      { label: "Protein",  val: String(targets.protein), unit: "g" },
                      { label: "Carbs",    val: String(targets.carbs),   unit: "g" },
                      { label: "Fat",      val: String(targets.fat),     unit: "g" },
                    ].map((t) => (
                      <div key={t.label} className="rounded-2xl bg-white/15 py-2.5 px-1">
                        <p className="font-display text-base font-bold tabular-nums leading-none">{t.val}</p>
                        <p className="mt-0.5 text-[9px] opacity-70">{t.unit}</p>
                        <p className="text-[9px] opacity-55">{t.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fitness goal — horizontal slider */}
                <section>
                  <SectionHeader title="Fitness goal" />
                  <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                    {GOALS.map((g) => {
                      const active = profile.goal === g.value;
                      return (
                        <button
                          key={g.value}
                          onClick={() => { dispatch(setGoal(g.value)); profileApi.update({ goal: g.value }).catch(() => {}); }}
                          className={`flex shrink-0 flex-col items-center gap-2 rounded-3xl border px-4 py-4 transition-all w-[120px] ${
                            active
                              ? "border-primary/60 bg-primary/10"
                              : "border-border bg-elevated hover:border-primary/30"
                          }`}
                        >
                          <span className={`grid size-9 place-items-center rounded-2xl ${active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <g.icon className="size-4" />
                          </span>
                          <p className={`text-xs font-bold text-center leading-tight ${active ? "text-primary" : ""}`}>{g.label}</p>
                          <p className="text-[10px] text-muted-foreground text-center leading-tight">{g.desc}</p>
                          {active && <span className="mt-auto grid size-4 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-2.5" /></span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex justify-center gap-1.5">
                    {GOALS.map((g, i) => (
                      <span key={i} className={`rounded-full transition-all duration-200 ${profile.goal === g.value ? "w-4 h-1.5 bg-primary" : "size-1.5 bg-muted-foreground/25"}`} />
                    ))}
                  </div>
                </section>

                {/* Activity level — horizontal slider */}
                <section>
                  <SectionHeader title="Activity level" />
                  <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                    {ACTIVITY.map((a) => {
                      const active = profile.activityLevel === a.value;
                      return (
                        <button
                          key={a.value}
                          onClick={() => { dispatch(setActivityLevel(a.value)); profileApi.update({ activityLevel: a.value }).catch(() => {}); }}
                          className={`flex shrink-0 flex-col items-center gap-2 rounded-3xl border px-4 py-4 transition-all w-[110px] ${
                            active
                              ? "border-primary/60 bg-primary/10"
                              : "border-border bg-elevated hover:border-primary/30"
                          }`}
                        >
                          <span className={`grid size-9 place-items-center rounded-2xl ${active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <Activity className="size-4" />
                          </span>
                          <p className={`text-xs font-bold text-center ${active ? "text-primary" : ""}`}>{a.label}</p>
                          <p className="text-[10px] text-muted-foreground text-center leading-tight">{a.desc}</p>
                          {active && <span className="mt-auto grid size-4 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-2.5" /></span>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex justify-center gap-1.5">
                    {ACTIVITY.map((a, i) => (
                      <span key={i} className={`rounded-full transition-all duration-200 ${profile.activityLevel === a.value ? "w-4 h-1.5 bg-primary" : "size-1.5 bg-muted-foreground/25"}`} />
                    ))}
                  </div>
                </section>

                {/* Logout */}
                <section className="pb-[max(2rem,env(safe-area-inset-bottom))]">
                  <button
                    onClick={() => { dispatch(logout()); onClose(); }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/15"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </section>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
