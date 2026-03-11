"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, ArrowLeft, CheckCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axios from "axios";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/config";

const registerSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    try {
      setIsLoading(true);
      setError(null);

      await axios.post(`${BACKEND_URL}/api/auth/register`, {
        email: data.email,
        password: data.password,
      });

      toast.success("Registration successful", {
        description: "You can now login",
      });

      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to home</span>
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                BetterMonitor
              </span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Create Account
            </h1>
            <p className="text-foreground/70">
              Start monitoring your websites in minutes
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isLoading}
                      className="bg-background border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>

        {/* Sign In Link */}
        <div className="mt-8 text-center">
          <p className="text-foreground/70">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-10 pt-8 border-t border-border/50 space-y-4">
          <p className="text-sm font-medium text-foreground/60">
            What you get:
          </p>
          <div className="space-y-2">
            {[
              "Real-time website monitoring",
              "Instant alerts & notifications",
              "Detailed analytics & reports",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground/70">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
