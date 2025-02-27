"use client";

import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ProfileHeaderProps {
  user: User | null;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  if (!user) {
    return (
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
    );
  }

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.imageUrl || undefined} alt={user.name || "User"} />
          <AvatarFallback className="text-lg">
            {user.name ? getInitials(user.name) : user.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">{user.name || "User"}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Member for {formatDistanceToNow(user.createdAt, { addSuffix: false })}
          </p>
        </div>
      </div>
    </div>
  );
} 