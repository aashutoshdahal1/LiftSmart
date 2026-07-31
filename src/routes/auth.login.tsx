import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout, GoogleButton } from "@/features/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Log in — LiftSmart AI Fitness Coach" },
      { name: "description", content: "Log in to LiftSmart to see today's adaptive workout and macros." },
      { property: "og:title", content: "Log in — LiftSmart" },
      { property: "og:description", content: "Access your adaptive training and nutrition plan." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Your streak is waiting. Let's keep it alive."
      footer={
        <>
          New here?{" "}
          <Link to="/auth/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(() => {
          toast.success("Welcome back, Alex");
          navigate({ to: "/dashboard" });
        })}
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="mt-2 h-12 rounded-2xl bg-elevated"
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="mt-2 h-12 rounded-2xl bg-elevated"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>
          ) : null}
        </div>
        <Button type="submit" size="lg" className="h-12 w-full rounded-2xl" disabled={isSubmitting}>
          Log in
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton label="Continue with Google" />
    </AuthLayout>
  );
}
