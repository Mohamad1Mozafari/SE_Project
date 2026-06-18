import { ArrowRight, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function Wireframes() {
  const screens = [
    {
      name: "Login",
      path: "/",
      description: "Entry point with username/password authentication",
      nextSteps: ["Dashboard"],
    },
    {
      name: "Dashboard",
      path: "/app",
      description: "Main hub with stats, quick actions, and recent activity",
      nextSteps: ["Vehicle Entry", "Vehicle Exit", "Parking Status", "All Management Screens"],
    },
    {
      name: "Vehicle Entry",
      path: "/app/vehicle-entry",
      description: "Register new vehicles with plate number and assign parking spot",
      nextSteps: ["Dashboard", "Parking Status"],
    },
    {
      name: "Vehicle Exit",
      path: "/app/vehicle-exit",
      description: "Search vehicle, calculate fees, process exit",
      nextSteps: ["Dashboard", "Reports"],
    },
    {
      name: "Parking Status",
      path: "/app/parking-status",
      description: "Visual grid of all parking spots showing availability",
      nextSteps: ["Dashboard", "Vehicle Entry"],
    },
    {
      name: "Operator Management",
      path: "/app/operator-management",
      description: "Manage parking operators and staff members",
      nextSteps: ["Dashboard", "Shift Management"],
    },
    {
      name: "Shift Management",
      path: "/app/shift-management",
      description: "View and manage operator shifts and schedules",
      nextSteps: ["Dashboard", "Shift Change Request"],
    },
    {
      name: "Shift Change Request",
      path: "/app/shift-change-request",
      description: "Submit and approve shift change requests",
      nextSteps: ["Dashboard", "Shift Management"],
    },
    {
      name: "Tariff Management",
      path: "/app/tariff-management",
      description: "Configure parking rates and pricing",
      nextSteps: ["Dashboard", "Reports"],
    },
    {
      name: "Reports",
      path: "/app/reports",
      description: "Generate various reports (daily, revenue, occupancy)",
      nextSteps: ["Dashboard"],
    },
    {
      name: "User Management",
      path: "/app/user-management",
      description: "Manage system users and permissions",
      nextSteps: ["Dashboard"],
    },
    {
      name: "System Logs",
      path: "/app/system-logs",
      description: "View system activity and audit logs",
      nextSteps: ["Dashboard"],
    },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Wireframes & User Flow</h1>
        <p className="text-gray-600">
          Public Parking Management System - Screen Navigation Map
        </p>
      </div>

      {/* User Flow Diagram */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Primary User Flow</CardTitle>
          <CardDescription>Main navigation paths through the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {/* Login */}
            <div className="bg-blue-100 border-2 border-blue-600 rounded-lg p-4 text-center min-w-[200px]">
              <p className="font-bold text-blue-900">Login</p>
              <p className="text-xs text-blue-700">Authentication</p>
            </div>
            <ArrowDown className="w-6 h-6 text-gray-400" />
            
            {/* Dashboard */}
            <div className="bg-green-100 border-2 border-green-600 rounded-lg p-4 text-center min-w-[200px]">
              <p className="font-bold text-green-900">Dashboard</p>
              <p className="text-xs text-green-700">Central Hub</p>
            </div>
            
            {/* Main Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <div className="bg-purple-50 border border-purple-400 rounded-lg p-3 text-center w-[180px]">
                <p className="font-semibold text-purple-900 text-sm">Vehicle Entry</p>
              </div>
              <div className="bg-purple-50 border border-purple-400 rounded-lg p-3 text-center w-[180px]">
                <p className="font-semibold text-purple-900 text-sm">Vehicle Exit</p>
              </div>
              <div className="bg-purple-50 border border-purple-400 rounded-lg p-3 text-center w-[180px]">
                <p className="font-semibold text-purple-900 text-sm">Parking Status</p>
              </div>
            </div>
            
            {/* Management Screens */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-orange-50 border border-orange-400 rounded-lg p-3 text-center w-[140px]">
                <p className="font-medium text-orange-900 text-xs">Operators</p>
              </div>
              <div className="bg-orange-50 border border-orange-400 rounded-lg p-3 text-center w-[140px]">
                <p className="font-medium text-orange-900 text-xs">Shifts</p>
              </div>
              <div className="bg-orange-50 border border-orange-400 rounded-lg p-3 text-center w-[140px]">
                <p className="font-medium text-orange-900 text-xs">Tariffs</p>
              </div>
              <div className="bg-orange-50 border border-orange-400 rounded-lg p-3 text-center w-[140px]">
                <p className="font-medium text-orange-900 text-xs">Reports</p>
              </div>
              <div className="bg-orange-50 border border-orange-400 rounded-lg p-3 text-center w-[140px]">
                <p className="font-medium text-orange-900 text-xs">Users</p>
              </div>
              <div className="bg-orange-50 border border-orange-400 rounded-lg p-3 text-center w-[140px]">
                <p className="font-medium text-orange-900 text-xs">Logs</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Screen Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screens.map((screen) => (
          <Card key={screen.name} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{screen.name}</CardTitle>
              <CardDescription className="text-xs font-mono">{screen.path}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-4">{screen.description}</p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">Navigation To:</p>
                <div className="flex flex-wrap gap-2">
                  {screen.nextSteps.map((step) => (
                    <span
                      key={step}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200"
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Features */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Features</CardTitle>
          <CardDescription>Core capabilities of the parking management system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Operations</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Real-time vehicle entry/exit tracking</li>
                <li>• Automatic parking spot assignment</li>
                <li>• Fee calculation based on duration</li>
                <li>• Visual parking status grid</li>
                <li>• Payment processing confirmation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Management</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Operator and user management</li>
                <li>• Shift scheduling and change requests</li>
                <li>• Configurable tariff rates</li>
                <li>• Comprehensive reporting system</li>
                <li>• Complete audit logs and activity tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Design Notes */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Design Principles</CardTitle>
          <CardDescription>Desktop-first design for parking operators</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Clean Layout:</strong> Sidebar navigation with consistent page structure</li>
            <li>• <strong>Quick Access:</strong> Dashboard provides fast navigation to all major functions</li>
            <li>• <strong>Visual Feedback:</strong> Color-coded status indicators (green/red/orange)</li>
            <li>• <strong>Efficient Workflow:</strong> Minimal clicks to complete common tasks</li>
            <li>• <strong>Data Visibility:</strong> Important metrics prominently displayed</li>
            <li>• <strong>Role-Based:</strong> Suitable for operators, managers, and administrators</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
