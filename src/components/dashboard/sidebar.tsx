"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { User } from "@prisma/client";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  ListTodo,
  Settings,
  CreditCard,
  UserCircle,
  LogOut,
  ChevronDown,
  Calendar,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardSidebarProps {
  user?: User | null;
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  
  // Use Clerk user data if database user is not provided
  const userName = user?.name || clerkUser?.fullName || "User";
  const userEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || "";
  const userImageUrl = user?.imageUrl || clerkUser?.imageUrl || "";
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };
  
  const initials = userName ? getInitials(userName) : userEmail.charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col border-r bg-muted/10">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="h-6 w-6 rounded-full bg-primary text-xs font-medium text-primary-foreground flex items-center justify-center">B</span>
          <span>Boardly</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/dashboard" && "bg-muted text-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/boards"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/dashboard/boards" ||
                pathname.startsWith("/dashboard/boards/") &&
                "bg-muted text-foreground"
            )}
          >
            <ListTodo className="h-4 w-4" />
            Boards
          </Link>
          <Link
            href="/dashboard/calendar"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/dashboard/calendar" && "bg-muted text-foreground"
            )}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Link>
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/dashboard/settings" && "bg-muted text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <Link
            href="/dashboard/billing"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === "/dashboard/billing" && "bg-muted text-foreground"
            )}
          >
            <CreditCard className="h-4 w-4" />
            Billing
          </Link>
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Theme</span>
          <ThemeToggle />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start px-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={userImageUrl} alt={userName} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs text-muted-foreground">{userEmail}</span>
                </div>
                <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Billing</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <SignOutButton>
                <button className="flex w-full items-center gap-2 text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </button>
              </SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 