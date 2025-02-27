"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export function AppearanceSettings() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Theme</h3>
          <p className="text-sm text-muted-foreground">
            Select your preferred theme for the dashboard
          </p>
          
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="light"
                id="theme-light"
                className="sr-only"
              />
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <div className="w-full rounded-md border border-border bg-background p-2 flex items-center justify-center">
                  <span className="text-xs">Light</span>
                </div>
                <span className="text-xs font-medium">Light</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="dark"
                id="theme-dark"
                className="sr-only"
              />
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <div className="w-full rounded-md border border-border bg-slate-950 p-2 flex items-center justify-center">
                  <span className="text-xs text-slate-200">Dark</span>
                </div>
                <span className="text-xs font-medium">Dark</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem
                value="system"
                id="theme-system"
                className="sr-only"
              />
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center gap-2 rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary"
              >
                <div className="w-full rounded-md border border-border bg-background p-2 flex items-center justify-center">
                  <span className="text-xs">System</span>
                </div>
                <span className="text-xs font-medium">System</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Density</h3>
          <p className="text-sm text-muted-foreground">
            Adjust the density of the user interface
          </p>
          
          <RadioGroup defaultValue="default" className="flex gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="compact" id="density-compact" />
              <Label htmlFor="density-compact">Compact</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="density-default" />
              <Label htmlFor="density-default">Default</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="density-comfortable" />
              <Label htmlFor="density-comfortable">Comfortable</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
} 