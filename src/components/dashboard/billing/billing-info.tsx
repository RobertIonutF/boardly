import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Subscription {
  status: string;
  plan: string;
  renewalDate: Date;
  amount: number;
}

interface BillingInfoProps {
  subscription: Subscription;
}

export function BillingInfo({ subscription }: BillingInfoProps) {
  const { status, plan, renewalDate, amount } = subscription;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>
          You are currently on the {plan} plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-primary/10 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-medium">{plan} Plan</h3>
            <p className="text-sm text-muted-foreground">
              {amount > 0 
                ? `$${amount}/month, renews on ${format(renewalDate, 'MMM d, yyyy')}`
                : "Free plan with basic features"}
            </p>
          </div>
          <Badge className={`ml-auto ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
} 