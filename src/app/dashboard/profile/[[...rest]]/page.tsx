import { Metadata } from "next";
import { getCurrentUser } from "@/lib/db/get-current-user";
import { ProfileHeader } from "@/components/dashboard/profile/profile-header";
import { UserProfile } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Profile | Boardly",
  description: "Manage your profile and account settings",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <ProfileHeader user={user} />
      
      <div className="rounded-lg border bg-card">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "mx-auto w-full max-w-3xl py-8",
              card: "shadow-none border-0",
            },
          }}
        />
      </div>
    </div>
  );
} 