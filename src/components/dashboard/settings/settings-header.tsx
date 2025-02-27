import { User } from "@prisma/client";

interface SettingsHeaderProps {
  user: User | null;
}

export function SettingsHeader({ user }: SettingsHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <p className="text-muted-foreground">
        {user ? `Manage account settings for ${user.name || user.email}` : "Manage your account settings and preferences"}
      </p>
    </div>
  );
} 