import { DashboardSidebar } from "@/components/dashboard/sidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Boardly",
  description: "Manage your projects and tasks with Boardly's intuitive dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
} 