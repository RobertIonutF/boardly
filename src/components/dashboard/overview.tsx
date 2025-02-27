'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import type { DashboardStats } from "@/lib/db/get-dashboard-stats";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Default board categories for the pie chart when no real data is available
const defaultBoardCategories = [
  { name: 'Work', value: 0 },
  { name: 'Personal', value: 0 },
  { name: 'Study', value: 0 },
  { name: 'Other', value: 0 },
];

interface DashboardOverviewProps {
  stats: DashboardStats;
  recentBoards: Array<{
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    listCount: number;
    cardCount: number;
  }>;
}

export function DashboardOverview({ stats, recentBoards }: DashboardOverviewProps) {
  const taskCompletionConfig = {
    completed: {
      label: "Completed",
      color: "#0088FE",
    },
    pending: {
      label: "Pending",
      color: "#FFBB28",
    },
  };

  const boardActivityConfig = {
    created: {
      label: "Created",
      color: "#0088FE",
    },
    updated: {
      label: "Updated",
      color: "#00C49F",
    },
    completed: {
      label: "Completed",
      color: "#FFBB28",
    },
  };

  // Create a simple board distribution by categorizing boards based on their titles
  // In a real app, you would have a proper category field in your database
  const boardDistributionData = defaultBoardCategories.map(category => {
    const count = recentBoards.filter(board => 
      board.title.toLowerCase().includes(category.name.toLowerCase())
    ).length;
    
    return {
      ...category,
      value: count || category.value,
    };
  });

  // Add an "Other" category for boards that don't match any category
  const categorizedCount = boardDistributionData.reduce((acc, curr) => acc + curr.value, 0);
  if (categorizedCount < recentBoards.length) {
    const otherIndex = boardDistributionData.findIndex(c => c.name === 'Other');
    if (otherIndex >= 0) {
      boardDistributionData[otherIndex].value += (recentBoards.length - categorizedCount);
    }
  }

  // Filter out categories with zero value
  const filteredBoardDistribution = boardDistributionData.filter(item => item.value > 0);

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Boards</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="7" height="7" x="3" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="3" rx="1" />
              <rect width="7" height="7" x="14" y="14" rx="1" />
              <rect width="7" height="7" x="3" y="14" rx="1" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBoards}</div>
            <p className="text-xs text-muted-foreground">
              {stats.boardsCreatedLastMonth > 0 
                ? `+${stats.boardsCreatedLastMonth} from last month` 
                : "No new boards last month"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCards}</div>
            <p className="text-xs text-muted-foreground">
              {stats.cardsCreatedLastWeek > 0 
                ? `+${stats.cardsCreatedLastWeek} from last week` 
                : "No new tasks last week"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Based on completed vs. total tasks
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>
              Your task completion rate over the past month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={taskCompletionConfig} className="h-[300px]">
              <AreaChart
                data={stats.taskCompletionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFBB28" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#0088FE" 
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="pending" 
                  stroke="#FFBB28" 
                  fillOpacity={1} 
                  fill="url(#colorPending)" 
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Board Distribution</CardTitle>
            <CardDescription>
              Distribution of your boards by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredBoardDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {filteredBoardDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} boards`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Board Activity</CardTitle>
          <CardDescription>
            Your activity across all boards in the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={boardActivityConfig} className="h-[200px]">
            <BarChart
              data={stats.boardActivityData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="created" stackId="a" fill="#0088FE" />
              <Bar dataKey="updated" stackId="a" fill="#00C49F" />
              <Bar dataKey="completed" stackId="a" fill="#FFBB28" />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
} 