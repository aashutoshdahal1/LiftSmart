import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppSelector } from "@/store";

const schema = z.object({
  weight: z.coerce.number().min(25, "Too low").max(400, "Too high"),
  note: z.string().max(140).optional(),
});

type FormValues = z.input<typeof schema>;

export function WeightLogForm({ onLogged }: { onLogged: (weight: number) => void }) {
  const entries = useAppSelector((s) => s.weight.entries);
  const profileWeight = useAppSelector((s) => s.profile.weightKg);
  const latestKg = entries[entries.length - 1]?.kg ?? profileWeight;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { weight: latestKg, note: "" },
  });

  return (
    <form
      className="surface-card space-y-4 rounded-3xl p-5"
      onSubmit={handleSubmit((values) => {
        const parsed = schema.parse(values);
        onLogged(parsed.weight);
        toast.success("Weight logged", { description: `${parsed.weight} kg · trend updated` });
        reset({ weight: parsed.weight, note: "" });
      })}
    >
      <div>
        <Label htmlFor="weight">Today's weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          inputMode="decimal"
          className="mt-2 h-12 rounded-2xl bg-elevated font-display text-lg"
          {...register("weight")}
        />
        {errors.weight ? (
          <p className="mt-1.5 text-xs text-destructive">{errors.weight.message}</p>
        ) : null}
      </div>
      <div>
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea
          id="note"
          rows={2}
          placeholder="Slept 7h30, felt light…"
          className="mt-2 rounded-2xl bg-elevated"
          {...register("note")}
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        Log weight
      </Button>
    </form>
  );
}
