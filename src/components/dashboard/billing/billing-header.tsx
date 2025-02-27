import { User } from "@prisma/client";

interface BillingHeaderProps {
  user: User | null;
}

export function BillingHeader({ user }: BillingHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
      <p className="text-muted-foreground">
        {user ? `Manage billing for ${user.name || user.email}` : "Manage your subscription and billing information"}
      </p>
    </div>
  );
} 