import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  FileText,
  ScanLine,
  Search,
  Brain,
  ScrollText,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  History,
  Bell,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
  role: "driver" | "police" | "admin";
}

const driverLinks = [
  { to: "/app/driver/dashboard", icon: LayoutDashboard, label: "Driver Dashboard" },
  { to: "/app/driver/wallet", icon: Wallet, label: "Identity Wallet" },
  { to: "/app/driver/passport", icon: FileText, label: "Digital Behaviour Passport" },
  { to: "/app/driver/profile", icon: User, label: "Driver Profile" },
  { to: "/app/driver/history", icon: History, label: "Behaviour History" },
  { to: "/app/notifications", icon: Bell, label: "Notifications" },
];

const policeLinks = [
  { to: "/app/police/verification", icon: ScanLine, label: "Verification Console" },
];

const adminLinks = [
  { to: "/app/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/admin/search", icon: Search, label: "Driver Search" },
  { to: "/app/admin/ai-analysis", icon: Brain, label: "AI Behaviour Analysis" },
  { to: "/app/admin/logs", icon: ScrollText, label: "System Logs" },
  { to: "/app/admin/user-management", icon: Users, label: "User Management" },
];

export function Sidebar({ role }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = role === "driver" ? driverLinks : role === "police" ? policeLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 bg-card border-r border-border flex flex-col transform transition-all duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-card border border-border rounded-full items-center justify-center hover:bg-accent transition-colors z-50"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-foreground" />
          )}
        </button>

        <div className="flex-1 py-6 px-4">
          <nav className="space-y-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  } ${isCollapsed ? "lg:justify-center" : ""}`
                }
                title={isCollapsed ? link.label : ""}
              >
                {({ isActive }) => (
                  <>
                    <link.icon className="w-5 h-5 flex-shrink-0" />
                    <span className={`text-sm font-medium ${isCollapsed ? "lg:hidden" : ""}`}>
                      {link.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-foreground hover:bg-accent transition-colors ${
              isCollapsed ? "lg:justify-center" : ""
            }`}
            title={isCollapsed ? "Logout" : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`text-sm font-medium ${isCollapsed ? "lg:hidden" : ""}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}