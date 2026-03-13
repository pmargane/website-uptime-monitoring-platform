"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-foreground">BetterMonitor</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {session ? (
              <>
                <Link
                  href="/home"
                  className="text-sm text-foreground/70 hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" className="text-sm">
                      {session.user?.name || session.user?.email}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href="/home">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="cursor-pointer text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            {mobileMenuOpen ? (
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-foreground"
              >
                <X className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border">
            {session ? (
              <>
                <Link
                  href="/home"
                  className="block px-0 py-2 text-sm text-foreground/70 hover:text-foreground"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left text-sm text-destructive py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2">
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" className="block py-2">
                  <Button className="w-full justify-start">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
