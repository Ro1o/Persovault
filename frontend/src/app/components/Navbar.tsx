import { Bell, Moon, Sun, User, LogOut } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  username: string;
}

export function Navbar({ username }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="h-16 bg-card/80 backdrop-blur border-b border-border flex items-center justify-between px-6 shadow-sm">

      {/* Left Section */}
      <div className="flex items-center gap-3">

        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">
            A
          </span>
        </div>

        <div>
          <h1 className="text-lg font-semibold text-foreground">
            PersoVault
          </h1>

          <p className="text-xs text-muted-foreground hidden sm:block">
            Secure Digital Identity Wallet
          </p>
        </div>

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Sun className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-muted transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />

          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>

          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
          >

            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>

            <span className="text-sm text-foreground hidden sm:block">
              {username}
            </span>

          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2 z-50">

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>

            </div>
          )}

        </div>

      </div>

    </nav>
  );
}

