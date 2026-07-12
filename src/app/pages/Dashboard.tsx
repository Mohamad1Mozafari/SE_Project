import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  LogIn,
  LogOut,
  ParkingSquare,
  Users,
  Clock,
  DollarSign,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { get_dashboard_stats, get_recent_activity } from "./DashboardHandler";

interface DashboardStats {
  total_capacity: number;
  occupied_spaces: number;
  available_spaces: number;
  net_change_today: number;
  todays_revenue: number;
  revenue_trend_pct: number | null;
}

interface RecentActivityItem {
  plate_number: string | null;
  action: "entry" | "exit";
  event_time: string;
  spot: string | null;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMins = Math.floor((now.getTime() - then.getTime()) / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const [stats, activity] = await Promise.all([
        get_dashboard_stats(),
        get_recent_activity(),
      ]);

      if (stats) {
        setStatsData(stats);
      } else {
        toast.error("Failed to load dashboard statistics");
      }

      if (activity) {
        setRecentActivity(activity);
      } else {
        toast.error("Failed to load recent activity");
      }

      setIsLoading(false);
    };

    loadDashboard();
  }, []);

  const stats = statsData
    ? [
        {
          title: "Total Capacity",
          value: statsData.total_capacity.toString(),
          icon: ParkingSquare,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          title: "Occupied Spaces",
          value: statsData.occupied_spaces.toString(),
          icon: Car,
          color: "text-red-600",
          bgColor: "bg-red-50",
          trend:
            statsData.net_change_today !== 0
              ? `${statsData.net_change_today > 0 ? "+" : ""}${statsData.net_change_today}`
              : undefined,
          trendUp: statsData.net_change_today >= 0,
        },
        {
          title: "Available Spaces",
          value: statsData.available_spaces.toString(),
          icon: ParkingSquare,
          color: "text-green-600",
          bgColor: "bg-green-50",
          trend:
            statsData.net_change_today !== 0
              ? `${-statsData.net_change_today > 0 ? "+" : ""}${-statsData.net_change_today}`
              : undefined,
          trendUp: -statsData.net_change_today >= 0,
        },
        {
          title: "Today's Revenue",
          value: `T${statsData.todays_revenue.toFixed(2)}`,
          icon: DollarSign,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          trend:
            statsData.revenue_trend_pct !== null
              ? `${statsData.revenue_trend_pct > 0 ? "+" : ""}${statsData.revenue_trend_pct}%`
              : undefined,
          trendUp: statsData.revenue_trend_pct !== null ? statsData.revenue_trend_pct >= 0 : undefined,
        },
      ]
    : [];

  const quickActions = [
    {
      title: "Vehicle Entry",
      description: "Register new vehicle entry",
      icon: LogIn,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/app/vehicle-entry",
    },
    {
      title: "Vehicle Exit",
      description: "Process vehicle exit and payment",
      icon: LogOut,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      path: "/app/vehicle-exit",
    },
    {
      title: "Parking Status",
      description: "View all parking spots",
      icon: ParkingSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
      path: "/app/parking-status",
    },
    {
      title: "Operators",
      description: "Manage operators and staff",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      path: "/app/operator-management",
    },
    {
      title: "Shift Management",
      description: "View and manage shifts",
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      path: "/app/shift-management",
    },
    {
      title: "Reports",
      description: "Generate and view reports",
      icon: FileText,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      path: "/app/reports",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the Parking Management System</p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-12">Loading dashboard...</div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        {stat.trend && (
                          <div className="flex items-center gap-1 mt-2">
                            {stat.trendUp ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm ${stat.trendUp ? "text-green-600" : "text-red-600"}`}>
                              {stat.trend}
                            </span>
                            <span className="text-sm text-gray-500">today</span>
                          </div>
                        )}
                      </div>
                      <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.title}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(action.path)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                          <CardDescription className="mt-1">{action.description}</CardDescription>
                        </div>
                        <div className={`${action.bgColor} ${action.color} p-2 rounded-lg`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <span className="text-sm">Go to {action.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest vehicle entries and exits</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            activity.action === "entry"
                              ? "bg-green-50 text-green-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {activity.action === "entry" ? (
                            <LogIn className="w-4 h-4" />
                          ) : (
                            <LogOut className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{activity.plate_number}</p>
                          <p className="text-sm text-gray-500">
                            {activity.spot ? `Spot ${activity.spot}` : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {activity.action === "entry" ? "Entry" : "Exit"}
                        </p>
                        <p className="text-xs text-gray-400">{timeAgo(activity.event_time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
