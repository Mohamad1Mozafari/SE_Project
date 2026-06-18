import { useNavigate } from "react-router";
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
  TrendingDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

export function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Total Capacity",
      value: "250",
      icon: ParkingSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Occupied Spaces",
      value: "187",
      icon: Car,
      color: "text-red-600",
      bgColor: "bg-red-50",
      trend: "+12",
      trendUp: true,
    },
    {
      title: "Available Spaces",
      value: "63",
      icon: ParkingSquare,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "-12",
      trendUp: false,
    },
    {
      title: "Today's Revenue",
      value: "$2,450",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "+8%",
      trendUp: true,
    },
  ];

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

  const recentActivity = [
    { plate: "ABC-1234", action: "Entry", time: "2 mins ago", spot: "A-15" },
    { plate: "XYZ-5678", action: "Exit", time: "5 mins ago", spot: "B-22" },
    { plate: "DEF-9012", action: "Entry", time: "8 mins ago", spot: "C-08" },
    { plate: "GHI-3456", action: "Exit", time: "12 mins ago", spot: "A-31" },
    { plate: "JKL-7890", action: "Entry", time: "15 mins ago", spot: "D-19" },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to the Parking Management System</p>
      </div>

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
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    activity.action === "Entry" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                  }`}>
                    {activity.action === "Entry" ? <LogIn className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.plate}</p>
                    <p className="text-sm text-gray-500">Spot {activity.spot}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{activity.action}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
