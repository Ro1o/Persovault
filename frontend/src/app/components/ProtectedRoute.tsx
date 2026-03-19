import { Navigate, Outlet } from "react-router-dom";

type Role = "driver" | "police" | "admin";

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

function getStoredUser() {
  const stored =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const user = getStoredUser();

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to their own dashboard
  if (!allowedRoles.includes(user.role)) {
    const dashboards: Record<Role, string> = {
      driver: "/app/driver/dashboard",
      police: "/app/police/verification",
      admin:  "/app/admin/dashboard",
    };
    return <Navigate to={dashboards[user.role as Role]} replace />;
  }

  return <Outlet />;
}