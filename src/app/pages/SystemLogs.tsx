import { useState } from "react";
import { ArrowRight, Search, Filter, Download, AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";

export function SystemLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logLevel, setLogLevel] = useState("all");
  const [logCategory, setLogCategory] = useState("all");

  const logs = [
    {
      id: 1,
      timestamp: "2026-05-30 14:32:15",
      level: "info",
      category: "Vehicle Entry",
      message: "Vehicle ABC-1234 entered parking spot A-15",
      user: "John Operator",
    },
    {
      id: 2,
      timestamp: "2026-05-30 14:28:42",
      level: "success",
      category: "Vehicle Exit",
      message: "Vehicle XYZ-5678 exited. Payment processed: $15.00",
      user: "Sarah Manager",
    },
    {
      id: 3,
      timestamp: "2026-05-30 14:25:11",
      level: "warning",
      category: "System",
      message: "Parking capacity reached 90%. Consider alerting management.",
      user: "System",
    },
    {
      id: 4,
      timestamp: "2026-05-30 14:20:33",
      level: "info",
      category: "User Management",
      message: "New user 'Mike Smith' created with role 'Operator'",
      user: "Admin User",
    },
    {
      id: 5,
      timestamp: "2026-05-30 14:15:28",
      level: "error",
      category: "Payment",
      message: "Payment gateway timeout for transaction #12345",
      user: "System",
    },
    {
      id: 6,
      timestamp: "2026-05-30 14:10:55",
      level: "info",
      category: "Shift Management",
      message: "Shift change: John Operator started shift",
      user: "John Operator",
    },
    {
      id: 7,
      timestamp: "2026-05-30 14:05:12",
      level: "success",
      category: "Tariff Management",
      message: "Tariff 'Weekend Rate' updated to $3.00/hour",
      user: "Admin User",
    },
    {
      id: 8,
      timestamp: "2026-05-30 14:00:44",
      level: "warning",
      category: "Security",
      message: "Failed login attempt for user 'unknown_user'",
      user: "System",
    },
    {
      id: 9,
      timestamp: "2026-05-30 13:55:22",
      level: "info",
      category: "Reports",
      message: "Daily summary report generated for May 29, 2026",
      user: "System",
    },
    {
      id: 10,
      timestamp: "2026-05-30 13:50:08",
      level: "info",
      category: "Vehicle Entry",
      message: "Vehicle DEF-9012 entered parking spot C-08",
      user: "Mike Smith",
    },
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error": return <XCircle className="w-4 h-4 text-red-600" />;
      case "warning": return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "success": return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getLogBadgeColor = (level: string) => {
    switch (level) {
      case "error": return "bg-red-100 text-red-700";
      case "warning": return "bg-yellow-100 text-yellow-700";
      case "success": return "bg-green-100 text-green-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = logLevel === "all" || log.level === logLevel;
    const matchesCategory = logCategory === "all" || log.category === logCategory;
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const handleExport = () => {
    toast.success("Logs exported successfully");
  };

  const logStats = [
    { label: "Total Logs", value: logs.length, color: "text-blue-600" },
    { label: "Errors", value: logs.filter(l => l.level === "error").length, color: "text-red-600" },
    { label: "Warnings", value: logs.filter(l => l.level === "warning").length, color: "text-yellow-600" },
    { label: "Success", value: logs.filter(l => l.level === "success").length, color: "text-green-600" },
  ];

  return (
    <div className="p-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
        <span>Dashboard</span>
        <ArrowRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">System Logs</span>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
            <p className="text-gray-600 mt-1">View and analyze system activity logs</p>
          </div>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {logStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={logCategory} onValueChange={setLogCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Vehicle Entry">Vehicle Entry</SelectItem>
                <SelectItem value="Vehicle Exit">Vehicle Exit</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="User Management">User Management</SelectItem>
                <SelectItem value="Payment">Payment</SelectItem>
                <SelectItem value="Shift Management">Shift Management</SelectItem>
                <SelectItem value="Tariff Management">Tariff Management</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Reports">Reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getLogIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLogBadgeColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <Badge variant="outline">{log.category}</Badge>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">{log.timestamp}</span>
                  </div>
                  <p className="text-gray-900 mb-1">{log.message}</p>
                  <p className="text-xs text-gray-500">
                    User: <span className="font-medium">{log.user}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Info className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No logs found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
