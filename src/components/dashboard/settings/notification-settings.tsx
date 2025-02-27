"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NotificationSettingsProps {
  user: unknown; // Keep the interface for consistency but mark as unknown
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function NotificationSettings(props: NotificationSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Configure how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Email Notifications</h3>
          
          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="email-tasks">Task assignments</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails when tasks are assigned to you
              </p>
            </div>
            <Switch id="email-tasks" defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="email-comments">Comments</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails when someone comments on your tasks
              </p>
            </div>
            <Switch id="email-comments" defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="email-updates">Board updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about updates to boards you&apos;re a member of
              </p>
            </div>
            <Switch id="email-updates" defaultChecked={false} />
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">In-App Notifications</h3>
          
          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="app-tasks">Task assignments</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when tasks are assigned to you
              </p>
            </div>
            <Switch id="app-tasks" defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="app-comments">Comments</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when someone comments on your tasks
              </p>
            </div>
            <Switch id="app-comments" defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="app-updates">Board updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about updates to boards you&apos;re a member of
              </p>
            </div>
            <Switch id="app-updates" defaultChecked={true} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 