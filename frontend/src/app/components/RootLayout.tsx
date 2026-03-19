import { Outlet, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useEffect } from "react";

function LayoutContent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no user in context or storage → redirect to login
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Don't render anything while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">

      <Sidebar role={user.role} />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Navbar username={user.username} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export function RootLayout() {
  return (
    <AuthProvider>
      <LayoutContent />
    </AuthProvider>
  );
}