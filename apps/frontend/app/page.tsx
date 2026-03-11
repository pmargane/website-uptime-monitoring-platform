"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  Globe,
  Zap,
  TrendingUp,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
                  Monitor Your Websites{" "}
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    24/7
                  </span>
                </h1>
                <p className="text-xl text-foreground/70 leading-relaxed">
                  Get instant alerts when your websites go down. Track uptime,
                  response times, and performance metrics in real-time with our
                  powerful monitoring platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-base">
                    Start Monitoring Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="pt-8 border-t border-border/50 space-y-4">
                <p className="text-sm text-foreground/60">
                  Trusted by thousands of developers
                </p>
                <div className="flex flex-wrap gap-8">
                  {["Uptime guarantee", "SSL protected", "99.9% SLA"].map(
                    (feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-sm text-foreground/70">
                          {feature}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card border border-border rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">
                      System Status
                    </span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                </div>

                <div className="space-y-4">
                  {[
                    { name: "api.example.com", status: "UP", time: "2ms" },
                    { name: "app.example.com", status: "UP", time: "45ms" },
                    { name: "cdn.example.com", status: "UP", time: "12ms" },
                  ].map((site) => (
                    <div
                      key={site.name}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-foreground/60" />
                        <span className="text-sm font-medium text-foreground">
                          {site.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                          {site.status}
                        </span>
                        <span className="text-sm text-foreground/60">
                          {site.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-24 bg-background rounded-lg flex items-end gap-1 p-3">
                  {[65, 40, 75, 45, 80, 55, 90].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-sm"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Powerful Monitoring Features
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Everything you need to keep your websites running smoothly
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bell,
                title: "Smart Alerts",
                description:
                  "Get instant notifications via email when your sites go down",
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                description:
                  "Track uptime, response times, and performance trends over time",
              },
              {
                icon: Zap,
                title: "Real-time Monitoring",
                description:
                  "Check your websites every 60 seconds for instant insights",
              },
              {
                icon: Clock,
                title: "Uptime Reports",
                description:
                  "Get comprehensive reports on your website availability",
              },
              {
                icon: Shield,
                title: "Security & Privacy",
                description:
                  "Your data is encrypted and never shared with third parties",
              },
              {
                icon: TrendingUp,
                title: "Performance Insights",
                description:
                  "Identify bottlenecks and optimize your website performance",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl border border-border bg-background hover:border-primary/50 transition-colors duration-300"
                >
                  <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/70">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for getting started",
                features: [
                  "3 monitors",
                  "Email alerts",
                  "Basic analytics",
                  "Community support",
                ],
              },
              {
                name: "Pro",
                price: "$29",
                period: "/month",
                description: "For growing businesses",
                features: [
                  "50 monitors",
                  "SMS & Email alerts",
                  "Advanced analytics",
                  "Priority support",
                  "Custom integrations",
                ],
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large organizations",
                features: [
                  "Unlimited monitors",
                  "All integrations",
                  "SLA guarantee",
                  "Dedicated support",
                  "White-label option",
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border transition-colors duration-300 p-8 ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 relative"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-foreground/70">{plan.period}</span>
                  )}
                </div>
                <p className="text-foreground/70 mb-6">{plan.description}</p>
                <Button
                  className="w-full mb-8"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  Get Started
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-foreground/70"
                    >
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "How often do you check my websites?",
                a: "We check your websites every 60 seconds from multiple locations around the world to ensure accurate uptime reporting.",
              },
              {
                q: "Can I monitor multiple websites?",
                a: "Yes! Depending on your plan, you can monitor anywhere from 3 to unlimited websites.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, PayPal, and bank transfers for enterprise customers.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! Our Starter plan is completely free. Upgrade to Pro or Enterprise whenever you need more features.",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="p-6 rounded-xl border border-border bg-background hover:border-primary/50 transition-colors duration-300"
              >
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.q}
                </h3>
                <p className="text-foreground/70">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
              Ready to monitor your websites?
            </h2>
            <p className="text-xl text-foreground/70">
              Join thousands of developers monitoring their websites with
              BetterMonitor
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-base">
                Already have an account? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">BetterMonitor</span>
          </div>
          <div className="text-sm text-foreground/60">
            © 2024 BetterMonitor. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-foreground/60">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
