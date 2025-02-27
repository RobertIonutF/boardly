"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  const pathname = usePathname();
  
  // Don't render the navbar on dashboard routes
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="border-b w-full">
      <div className="container flex h-16 items-center justify-between py-4 max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="Boardly Logo"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          <span className="text-xl font-bold">Boardly</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
            How It Works
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignedIn>
            <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4 mr-2">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Sign Up Free</Button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
} 