import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useEffect } from "react";

function LayoutContent() {
  const { user, login } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      const path = location.pathname;

      if (path.includes("/driver")) {
        login("demo-driver", "password", "driver");
      } else if (path.includes("/police")) {
        login("demo-officer", "password", "police");
      } else if (path.includes("/admin")) {
        login("demo-admin", "password", "admin");
      }
    }
  }, [user, login, location.pathname]);

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