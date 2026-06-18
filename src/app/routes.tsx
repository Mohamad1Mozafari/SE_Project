import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { VehicleEntry } from "./pages/VehicleEntry";
import { VehicleExit } from "./pages/VehicleExit";
import { ParkingStatus } from "./pages/ParkingStatus";
import { OperatorManagement } from "./pages/OperatorManagement";
import { ShiftManagement } from "./pages/ShiftManagement";
import { ShiftChangeRequest } from "./pages/ShiftChangeRequest";
import { TariffManagement } from "./pages/TariffManagement";
import { Reports } from "./pages/Reports";
import { UserManagement } from "./pages/UserManagement";
import { SystemLogs } from "./pages/SystemLogs";
import { Wireframes } from "./pages/Wireframes";
import { MainLayout } from "./components/MainLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/wireframes",
    Component: Wireframes,
  },
  {
    path: "/app",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "vehicle-entry", Component: VehicleEntry },
      { path: "vehicle-exit", Component: VehicleExit },
      { path: "parking-status", Component: ParkingStatus },
      { path: "operator-management", Component: OperatorManagement },
      { path: "shift-management", Component: ShiftManagement },
      { path: "shift-change-request", Component: ShiftChangeRequest },
      { path: "tariff-management", Component: TariffManagement },
      { path: "reports", Component: Reports },
      { path: "user-management", Component: UserManagement },
      { path: "system-logs", Component: SystemLogs },
    ],
  },
]);