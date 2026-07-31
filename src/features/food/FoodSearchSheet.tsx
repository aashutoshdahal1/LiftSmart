import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { favoriteMeals, foodSearchResults, type FoodItem, type Meal } from "@/lib/mock-data";
import { useAppDispatch } from "@/store";
import { addFood } from "@/store/nutritionSlice";

interface FoodSearchSheetProps {
  slot: Meal["slot"] | null;
  onClose: () => void;
}

export function FoodSearchSheet({ slot, onClose }: FoodSearchSheetProps) {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");

  const results = useMemo(
    () =>
      foodSearchResults.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  const add = (item: FoodItem) => {
    if (!slot) return;
    dispatch(addFood({ slot, item }));
    toast.success(`${item.name} added to ${slot}`, { description: `+${item.calories} kcal` });
    onClose();
  };

  const List = ({ items }: { items: FoodItem[] }) => (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-2xl bg-elevated px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.serving} · {item.calories} kcal · P {item.protein}
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => add(item)}>
            Add
          </Button>
        </li>
      ))}
      {items.length === 0 ? (
        <li className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No matches. Try another search.
        </li>
      ) : null}
    </ul>
  );

  return (
    <Sheet open={slot !== null} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-4xl border-border bg-card px-5 pb-8">
        <SheetHeader className="px-0">
          <SheetTitle className="font-display">Add to {slot}</SheetTitle>
          <SheetDescription>Search 900k foods, or reuse a favourite.</SheetDescription>
        </SheetHeader>

        <div className="relative mt-2">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search food…"
            className="h-12 rounded-2xl bg-elevated pl-11"
            aria-label="Search food"
          />
        </div>

        <Tabs defaultValue="search" className="mt-4">
          <TabsList className="w-full rounded-2xl bg-elevated">
            <TabsTrigger value="search" className="flex-1 rounded-xl">
              Search
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1 rounded-xl">
              Favourites
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1 rounded-xl">
              Recent
            </TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="max-h-[42vh] overflow-y-auto">
            <List items={results} />
          </TabsContent>
          <TabsContent value="favorites" className="max-h-[42vh] overflow-y-auto">
            <List items={favoriteMeals} />
          </TabsContent>
          <TabsContent value="recent" className="max-h-[42vh] overflow-y-auto">
            <List items={foodSearchResults.slice(0, 3)} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
