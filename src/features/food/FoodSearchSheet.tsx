import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, Minus, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FOOD_DB } from "@/lib/food-database";
import { favoriteMeals, type FoodItem, type Meal } from "@/lib/mock-data";
import { useAppDispatch } from "@/store";
import { addFood } from "@/store/nutritionSlice";
import { nutritionApi } from "@/lib/api";

const MEAL_SLOTS: { slot: Meal["slot"]; emoji: string; time: string }[] = [
  { slot: "Breakfast", emoji: "🌅", time: "7–10 AM" },
  { slot: "Lunch",     emoji: "🥗", time: "12–2 PM" },
  { slot: "Dinner",    emoji: "🍽️", time: "6–9 PM"  },
  { slot: "Snack",     emoji: "🥤", time: "Any time" },
];

interface Props {
  open: boolean;
  slot: Meal["slot"] | null;
  onClose: () => void;
}

// ── Quantity picker row ────────────────────────────────────────────────────────
function FoodRow({
  item,
  onAdd,
}: {
  item: FoodItem;
  onAdd: (scaled: FoodItem) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  // Determine base unit (g vs servings)
  const isGrams = /\d+\s*g\b/.test(item.serving);
  const baseGrams = isGrams ? parseFloat(item.serving) || 100 : null;
  const [qty, setQty] = useState(baseGrams ?? 1);

  // Scale factor relative to the DB entry
  const factor = baseGrams !== null ? qty / baseGrams : qty;
  const scaled: FoodItem = {
    ...item,
    id: `${item.id}-${Date.now()}`,
    serving: baseGrams !== null ? `${qty} g` : `${qty} serving${qty !== 1 ? "s" : ""}`,
    calories: Math.round(item.calories * factor),
    protein:  Math.round(item.protein  * factor * 10) / 10,
    carbs:    Math.round(item.carbs    * factor * 10) / 10,
    fat:      Math.round(item.fat      * factor * 10) / 10,
  };

  function adjust(delta: number) {
    const step = baseGrams !== null ? 25 : 0.5;
    setQty((q) => Math.max(baseGrams !== null ? 10 : 0.5, Math.round((q + delta * step) * 10) / 10));
  }

  return (
    <li className="rounded-2xl bg-elevated overflow-hidden">
      {/* Main row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {item.serving} · <span className="font-semibold text-foreground">{item.calories} kcal</span>
            {" · "}P {item.protein}g · C {item.carbs}g · F {item.fat}g
          </p>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ duration: 0.18 }}
          className="grid size-7 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary"
        >
          <Plus className="size-3.5" />
        </motion.span>
      </button>

      {/* Quantity picker — expands inline */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-border/60"
          >
            <div className="px-4 py-3 space-y-3">
              {/* Quantity row */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  {baseGrams !== null ? "Amount (g)" : "Servings"}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjust(-1)}
                    className="grid size-7 place-items-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Minus className="size-3" />
                  </button>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={qty}
                    onChange={(e) => setQty(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
                    className="h-8 w-20 rounded-xl bg-muted text-center text-sm font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <button
                    onClick={() => adjust(1)}
                    className="grid size-7 place-items-center rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>
              </div>

              {/* Scaled macro preview */}
              <div className="grid grid-cols-4 gap-2 rounded-xl bg-muted px-3 py-2 text-center">
                {[
                  { label: "kcal", val: scaled.calories },
                  { label: "P",    val: `${scaled.protein}g` },
                  { label: "C",    val: `${scaled.carbs}g` },
                  { label: "F",    val: `${scaled.fat}g` },
                ].map((m) => (
                  <div key={m.label}>
                    <p className="font-semibold text-xs tabular-nums">{m.val}</p>
                    <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Confirm button */}
              <button
                onClick={() => onAdd(scaled)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Check className="size-4" />
                Add {scaled.calories} kcal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function FoodList({ items, onAdd }: { items: FoodItem[]; onAdd: (item: FoodItem) => void }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        No matches. Try a different search or use Custom.
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <FoodRow key={item.id} item={item} onAdd={onAdd} />
      ))}
    </ul>
  );
}

// ── Main sheet ─────────────────────────────────────────────────────────────────
export function FoodSearchSheet({ open, slot: initialSlot, onClose }: Props) {
  const dispatch = useAppDispatch();

  const [selectedSlot, setSelectedSlot] = useState<Meal["slot"] | null>(initialSlot);
  const [tab, setTab] = useState<"search" | "favourites" | "custom">("search");
  const [query, setQuery] = useState("");

  const [customName, setCustomName] = useState("");
  const [customCal, setCustomCal] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");

  const slot = selectedSlot ?? initialSlot;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FOOD_DB.slice(0, 20);
    return FOOD_DB.filter((f) =>
      f.name.toLowerCase().includes(q) || f.serving.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [query]);

  // Reset state when sheet opens/closes
  useMemo(() => {
    setSelectedSlot(initialSlot);
    setQuery("");
    setTab("search");
  }, [initialSlot, open]);

  function doAdd(item: FoodItem) {
    if (!slot) return;
    dispatch(addFood({ slot, item }));
    onClose();
    // Persist to backend — fire and forget
    nutritionApi.addFood(slot, item).catch(() => {});
  }

  function addCustom() {
    if (!customName.trim() || !customCal) return;
    doAdd({
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      serving: "1 serving",
      calories: parseFloat(customCal) || 0,
      protein:  parseFloat(customProtein) || 0,
      carbs:    parseFloat(customCarbs) || 0,
      fat:      parseFloat(customFat) || 0,
    });
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-[61] flex h-[90dvh] flex-col rounded-t-3xl bg-card"
          >
            <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-muted" />

            {/* Header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border/60 px-5 py-4">
              {!initialSlot && selectedSlot && (
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="grid size-8 place-items-center rounded-2xl bg-elevated text-muted-foreground"
                >
                  <ChevronLeft className="size-4" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-display text-base font-bold">
                  {selectedSlot ? `Add to ${selectedSlot}` : "Add Meal"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedSlot ? "Tap a food to set quantity" : "Select meal type first"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-2xl bg-elevated text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Step 1 — slot picker */}
            {!selectedSlot ? (
              <div className="p-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Which meal?</p>
                {MEAL_SLOTS.map((m) => (
                  <button
                    key={m.slot}
                    onClick={() => setSelectedSlot(m.slot)}
                    className="flex w-full items-center gap-4 rounded-3xl border border-border bg-elevated px-5 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{m.slot}</p>
                      <p className="text-xs text-muted-foreground">{m.time}</p>
                    </div>
                    <Plus className="ml-auto size-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            ) : (
              /* Step 2 — food picker */
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Tabs */}
                <div className="flex shrink-0 gap-1 border-b border-border/60 px-5 pt-3 pb-0">
                  {(["search", "favourites", "custom"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`rounded-t-xl px-4 py-2 text-xs font-semibold capitalize transition-colors ${
                        tab === t ? "bg-elevated text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t === "favourites" ? "Favourites" : t === "custom" ? "Custom" : "Search"}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto px-5 pb-8">
                  {/* Search */}
                  {tab === "search" && (
                    <div className="pt-4">
                      <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          autoFocus
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Search 100+ foods…"
                          className="h-11 rounded-2xl bg-elevated pl-11 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <FoodList items={results} onAdd={doAdd} />
                    </div>
                  )}

                  {/* Favourites */}
                  {tab === "favourites" && (
                    <div className="pt-4">
                      <FoodList items={favoriteMeals} onAdd={doAdd} />
                    </div>
                  )}

                  {/* Custom */}
                  {tab === "custom" && (
                    <div className="pt-4 space-y-4">
                      <p className="text-xs text-muted-foreground">Can't find your food? Enter it manually.</p>
                      <div>
                        <Label htmlFor="cf-name">Food name</Label>
                        <Input
                          id="cf-name" value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder="e.g. Homemade protein bar"
                          className="mt-1.5 h-11 rounded-2xl bg-elevated focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: "cf-cal",     label: "Calories (kcal) *", val: customCal,     set: setCustomCal },
                          { id: "cf-protein", label: "Protein (g)",       val: customProtein, set: setCustomProtein },
                          { id: "cf-carbs",   label: "Carbs (g)",         val: customCarbs,   set: setCustomCarbs },
                          { id: "cf-fat",     label: "Fat (g)",           val: customFat,     set: setCustomFat },
                        ].map((f) => (
                          <div key={f.id}>
                            <Label htmlFor={f.id}>{f.label}</Label>
                            <Input
                              id={f.id} type="number" inputMode="decimal"
                              value={f.val} onChange={(e) => f.set(e.target.value)}
                              placeholder="0"
                              className="mt-1.5 h-11 rounded-2xl bg-elevated text-center focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={addCustom}
                        disabled={!customName.trim() || !customCal}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
                      >
                        <Plus className="size-4" /> Add Custom Food
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
