import { createContext, useContext, useState } from "react";

type Role = "driver" | "police" | "admin";

interface AuthUser {
  username: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string, role: Role) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(() => {
    // Check localStorage first (remembered), then sessionStorage (not remembered)
    const stored =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    if (!stored) return null;

    return JSON.parse(stored);
  });

  const login = (username: string, password: string, role: Role) => {

    const credentials = {
      admin: { username: "admin", password: "admin123" },
      police: { username: "police", password: "police123" },
      driver: { username: "driver", password: "driver123" }
    };

    const account = credentials[role];

    if (username === account.username && password === account.password) {

      const userData = { username, role };

      localStorage.setItem("user", JSON.stringify(userData));

      setUser(userData);

      return true;
    }

    alert("Invalid credentials");

    return false;
  };

  const logout = () => {
    // Clear both storages on logout
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}