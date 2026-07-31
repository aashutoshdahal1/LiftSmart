import { zodResolver } from "@hookform/resolvers/zod";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout } from "@/features/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — LiftSmart" },
      { name: "description", content: "Send yourself a secure reset link for your LiftSmart account." },
      { property: "og:title", content: "Reset your password — LiftSmart" },
      { property: "og:description", content: "We'll email you a secure reset link." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <AuthLayout
      title="Reset password"
      subtitle="We'll email you a secure link to set a new one."
      footer={
        <Link to="/auth/login" className="font-medium text-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(() => toast.success("Reset link sent — check your inbox"))}
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
        <Button type="submit" size="lg" className="h-12 w-full rounded-2xl">
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  );
}
