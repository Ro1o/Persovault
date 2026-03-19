import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

export function ProtectedRoute({
  children,
  role
}: {
  children: ReactNode;
  role: "admin" | "driver" | "police";
}) {

  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return <Navigate to="/login" />;
  }

  const user = JSON.parse(storedUser);

  if (user.role !== role) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}