import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout, GoogleButton } from "@/features/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    name: z.string().min(2, "Tell us your name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — LiftSmart AI Fitness Coach" },
      {
        name: "description",
        content: "Start free with LiftSmart and get an adaptive training and nutrition plan in minutes.",
      },
      { property: "og:title", content: "Create your account — LiftSmart" },
      { property: "og:description", content: "Seven days free. Cancel anytime." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Seven days free. No card required."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/auth/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(() => {
          toast.success("Account created — let's build your plan");
          navigate({ to: "/onboarding" });
        })}
      >
        {(
          [
            { id: "name", label: "Full name", type: "text", ph: "Alex Rivera" },
            { id: "email", label: "Email", type: "email", ph: "you@example.com" },
            { id: "password", label: "Password", type: "password", ph: "••••••••" },
            { id: "confirm", label: "Confirm password", type: "password", ph: "••••••••" },
          ] as const
        ).map((f) => (
          <div key={f.id}>
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input
              id={f.id}
              type={f.type}
              placeholder={f.ph}
              className="mt-2 h-12 rounded-2xl bg-elevated"
              {...register(f.id)}
            />
            {errors[f.id] ? (
              <p className="mt-1.5 text-xs text-destructive">{errors[f.id]?.message as string}</p>
            ) : null}
          </div>
        ))}
        <Button type="submit" size="lg" className="h-12 w-full rounded-2xl">
          Create account
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton label="Sign up with Google" />
    </AuthLayout>
  );
}
