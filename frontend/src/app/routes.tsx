import { createBrowserRouter } from "react-router-dom";
import { RootLayout } from "./components/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";

import { DriverDashboard } from "./pages/driver/DriverDashboard";
import { IdentityWallet } from "./pages/driver/IdentityWallet";
import { DigitalNIC } from "./pages/driver/DigitalNIC";
import { DigitalLicence } from "./pages/driver/DigitalLicence";
import { DigitalTravelPassport } from "./pages/driver/DigitalTravelPassport";
import { DigitalPassport } from "./pages/driver/DigitalPassport";
import { PenaltyPoints } from "./pages/driver/PenaltyPoints";
import { DriverProfile } from "./pages/driver/DriverProfile";
import { BehaviourHistory } from "./pages/driver/BehaviourHistory";

import { NotificationCenter } from "./pages/NotificationCenter";

import { VerificationConsole } from "./pages/police/VerificationConsole";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { DriverSearch } from "./pages/admin/DriverSearch";
import { AIBehaviourAnalysis } from "./pages/admin/AIBehaviourAnalysis";
import { SystemLogs } from "./pages/admin/SystemLogs";
import { DriverDetailsPage } from "./pages/admin/DriverDetailsPage";
import { UserManagement } from "./pages/admin/UserManagement";

export const router = createBrowserRouter([
  // ─── Public ────────────────────────────────────────────────────
  { path: "/",       element: <LandingPage /> },
  { path: "/login",  element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },

  // ─── Protected (all under RootLayout) ──────────────────────────
  {
    path: "/app",
    element: <RootLayout />,
    children: [

      // Driver only
      {
        element: <ProtectedRoute allowedRoles={["driver"]} />,
        children: [
          { path: "driver/dashboard",       element: <DriverDashboard /> },
          { path: "driver/wallet",          element: <IdentityWallet /> },
          { path: "driver/nic",             element: <DigitalNIC /> },
          { path: "driver/licence",         element: <DigitalLicence /> },
          { path: "driver/travel-passport", element: <DigitalTravelPassport /> },
          { path: "driver/passport",        element: <DigitalPassport /> },
          { path: "driver/penalty-points",  element: <PenaltyPoints /> },
          { path: "driver/profile",         element: <DriverProfile /> },
          { path: "driver/history",         element: <BehaviourHistory /> },
        ],
      },

      // Police only
      {
        element: <ProtectedRoute allowedRoles={["police"]} />,
        children: [
          { path: "police/verification", element: <VerificationConsole /> },
        ],
      },

      // Admin only
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          { path: "admin/dashboard",        element: <AdminDashboard /> },
          { path: "admin/search",           element: <DriverSearch /> },
          { path: "admin/ai-analysis",      element: <AIBehaviourAnalysis /> },
          { path: "admin/logs",             element: <SystemLogs /> },
          { path: "admin/driver/:driverId", element: <DriverDetailsPage /> },
          { path: "admin/user-management",  element: <UserManagement /> },
        ],
      },

      // Any logged-in role
      {
        element: <ProtectedRoute allowedRoles={["driver", "police", "admin"]} />,
        children: [
          { path: "notifications", element: <NotificationCenter /> },
        ],
      },

    ],
  },
]);