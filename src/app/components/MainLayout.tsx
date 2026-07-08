import { Outlet, useNavigate, useLocation } from "react-router-dom";
// Imported your function helpers here
import { get_role, get_user_name } from "../pages/USername_role.js";
import { 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Car, 
  ParkingSquare,
  Users,
  Clock,
  RefreshCw,
  DollarSign,
  FileText,
  UserCog,
  ScrollText
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Call the functions directly and catch empty/null results with fallbacks
  const roleValue = get_role();
  const usernameValue = get_user_name();
  
  const currentRole = roleValue && roleValue.trim() !== "" ? roleValue : "undefined";
  const currentUsername = usernameValue && usernameValue.trim() !== "" ? usernameValue : "undefined";

  const menuItems = [
    { path: "/app", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { path: "/app/vehicle-entry", icon: LogIn, label: "Vehicle Entry" },
    { path: "/app/vehicle-exit", icon: LogOut, label: "Vehicle Exit" },
    { path: "/app/parking-status", icon: ParkingSquare, label: "Parking Status" },
    { path: "/app/operator-management", icon: Users, label: "Operator Management" },
    { path: "/app/shift-management", icon: Clock, label: "Shift Management" },
    { path: "/app/shift-change-request", icon: RefreshCw, label: "Shift Change Request" },
    { path: "/app/tariff-management", icon: DollarSign, label: "Tariff Management" },
    { path: "/app/reports", icon: FileText, label: "Reports" },
    { path: "/app/user-management", icon: UserCog, label: "User Management" },
    { path: "/app/system-logs", icon: ScrollText, label: "System Logs" },
  ];

  const isActive = (path: string, exact?: boolean) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Car className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="font-semibold text-lg">Parking System</h1>
              <p className="text-xs text-gray-500">Management Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <Separator />

        {/* Fixed lower left widget using the functional page properties */}
        <div className="p-4">
          <div className="mb-3 px-3 text-xs font-mono text-gray-600 space-y-0.5">
            <p>logged as <span className="font-bold text-blue-600">{currentRole}</span></p>
            <p>username is <span className="font-bold text-gray-900">{currentUsername}</span></p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}