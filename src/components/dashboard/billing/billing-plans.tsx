import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";

interface BillingPlansProps {
  currentPlan: string;
}

export function BillingPlans({ currentPlan }: BillingPlansProps) {
  return (
    <Tabs defaultValue="monthly" className="w-full">
      <div className="flex justify-center mb-8">
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">
            Yearly <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">Save 20%</Badge>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="monthly" className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PricingCard
            title="Free"
            description="Basic features for personal use"
            price="$0"
            features={[
              "Up to 3 boards",
              "Basic task management",
              "Limited file storage (100MB)",
              "Community support"
            ]}
            buttonText={currentPlan === "Free" ? "Current Plan" : "Downgrade"}
            buttonVariant={currentPlan === "Free" ? "outline" : "default"}
            disabled={currentPlan === "Free"}
          />
          <PricingCard
            title="Pro"
            description="Advanced features for professionals"
            price="$12"
            features={[
              "Unlimited boards",
              "Advanced task management",
              "5GB file storage",
              "Priority support",
              "Team collaboration",
              "Custom fields"
            ]}
            buttonText={currentPlan === "Pro" ? "Current Plan" : "Upgrade to Pro"}
            buttonVariant={currentPlan === "Pro" ? "outline" : "default"}
            disabled={currentPlan === "Pro"}
            popular
          />
          <PricingCard
            title="Enterprise"
            description="Enhanced security and control for teams"
            price="$49"
            features={[
              "Everything in Pro",
              "Unlimited file storage",
              "SSO & advanced security",
              "Admin controls",
              "Dedicated support",
              "Custom integrations",
              "Usage reports"
            ]}
            buttonText={currentPlan === "Enterprise" ? "Current Plan" : "Contact Sales"}
            buttonVariant={currentPlan === "Enterprise" ? "outline" : "default"}
            disabled={currentPlan === "Enterprise"}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="yearly" className="space-y-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <PricingCard
            title="Free"
            description="Basic features for personal use"
            price="$0"
            features={[
              "Up to 3 boards",
              "Basic task management",
              "Limited file storage (100MB)",
              "Community support"
            ]}
            buttonText={currentPlan === "Free" ? "Current Plan" : "Downgrade"}
            buttonVariant={currentPlan === "Free" ? "outline" : "default"}
            disabled={currentPlan === "Free"}
          />
          <PricingCard
            title="Pro"
            description="Advanced features for professionals"
            price="$9.60"
            period="per month, billed annually"
            features={[
              "Unlimited boards",
              "Advanced task management",
              "5GB file storage",
              "Priority support",
              "Team collaboration",
              "Custom fields"
            ]}
            buttonText={currentPlan === "Pro" ? "Current Plan" : "Upgrade to Pro"}
            buttonVariant={currentPlan === "Pro" ? "outline" : "default"}
            disabled={currentPlan === "Pro"}
            popular
          />
          <PricingCard
            title="Enterprise"
            description="Enhanced security and control for teams"
            price="$39.20"
            period="per month, billed annually"
            features={[
              "Everything in Pro",
              "Unlimited file storage",
              "SSO & advanced security",
              "Admin controls",
              "Dedicated support",
              "Custom integrations",
              "Usage reports"
            ]}
            buttonText={currentPlan === "Enterprise" ? "Current Plan" : "Contact Sales"}
            buttonVariant={currentPlan === "Enterprise" ? "outline" : "default"}
            disabled={currentPlan === "Enterprise"}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  buttonText: string;
  buttonVariant?: "default" | "outline";
  popular?: boolean;
  disabled?: boolean;
}

function PricingCard({
  title,
  description,
  price,
  period = "per month",
  features,
  buttonText,
  buttonVariant = "default",
  popular = false,
  disabled = false,
}: PricingCardProps) {
  return (
    <Card className={popular ? "border-primary shadow-md relative" : ""}>
      {popular && (
        <Badge className="absolute -top-3 right-4 bg-primary text-primary-foreground">
          Most Popular
        </Badge>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-sm text-muted-foreground ml-1">{period}</span>
        </div>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          variant={buttonVariant}
          className="w-full"
          disabled={disabled}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
} 