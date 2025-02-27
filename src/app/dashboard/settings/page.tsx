import { Metadata } from "next";
import { getCurrentUser } from "@/lib/db/get-current-user";
import { SettingsHeader } from "@/components/dashboard/settings/settings-header";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";
import { NotificationSettings } from "@/components/dashboard/settings/notification-settings";
import { AppearanceSettings } from "@/components/dashboard/settings/appearance-settings";

export const metadata: Metadata = {
  title: "Settings | Boardly",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <SettingsHeader user={user} />
      
      <div className="grid gap-8 md:grid-cols-2">
        <SettingsForm user={user} />
        <div className="space-y-8">
          <NotificationSettings user={user} />
          <AppearanceSettings />
        </div>
      </div>
    </div>
  );
} 