import { Metadata } from "next";
import { getCurrentUser } from "@/lib/db/get-current-user";
import { BillingHeader } from "@/components/dashboard/billing/billing-header";
import { BillingInfo } from "@/components/dashboard/billing/billing-info";
import { BillingPlans } from "@/components/dashboard/billing/billing-plans";
import { BillingHistory } from "@/components/dashboard/billing/billing-history";

export const metadata: Metadata = {
  title: "Billing | Boardly",
  description: "Manage your subscription and billing information",
};

export default async function BillingPage() {
  const user = await getCurrentUser();

  // In a real app, you would fetch subscription data from your payment provider
  // This is a placeholder for demonstration purposes
  const subscription = {
    status: "active",
    plan: "Free",
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    amount: 0,
  };

  // Placeholder billing history
  const billingHistory = [
    {
      id: "INV-001",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      amount: 0,
      status: "paid",
      description: "Free Plan - Monthly",
    },
  ];

  return (
    <div className="space-y-8">
      <BillingHeader user={user} />
      <BillingInfo subscription={subscription} />
      <BillingPlans currentPlan={subscription.plan} />
      <BillingHistory invoices={billingHistory} />
    </div>
  );
} 