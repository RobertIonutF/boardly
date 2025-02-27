import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { DownloadIcon } from "lucide-react";

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: string;
  description: string;
}

interface BillingHistoryProps {
  invoices: Invoice[];
}

export function BillingHistory({ invoices }: BillingHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>
          View your recent billing history and download invoices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          {invoices.length > 0 ? (
            <div className="divide-y">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium">{invoice.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(invoice.date, "MMMM d, yyyy")} · {invoice.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      ${invoice.amount.toFixed(2)}
                    </p>
                    <Button variant="outline" size="icon" title="Download invoice">
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium">No billing history available</p>
                <p className="text-sm text-muted-foreground">
                  Your billing history will appear here once you subscribe to a paid plan.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 