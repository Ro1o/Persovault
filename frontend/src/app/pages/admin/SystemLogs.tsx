import { useState } from "react";
import { Filter, CheckCircle2, XCircle, Shield } from "lucide-react";

const mockLogs = [
  {
    id: 1,
    timestamp: "2026-03-13 14:32:15",
    userRole: "Police",
    action: "Verification",
    driverId: "DRV-001",
    result: "VALID",
    details: "QR Code verification successful",
  },
  {
    id: 2,
    timestamp: "2026-03-13 14:28:42",
    userRole: "Admin",
    action: "Passport Generation",
    driverId: "DRV-045",
    result: "SUCCESS",
    details: "New passport issued",
  },
  {
    id: 3,
    timestamp: "2026-03-13 14:15:33",
    userRole: "Police",
    action: "Verification",
    driverId: "DRV-023",
    result: "EXPIRED",
    details: "Passport expired on 2026-03-01",
  },
  {
    id: 4,
    timestamp: "2026-03-13 14:10:22",
    userRole: "Driver",
    action: "Login",
    driverId: "DRV-001",
    result: "SUCCESS",
    details: "User authentication successful",
  },
  {
    id: 5,
    timestamp: "2026-03-13 14:05:11",
    userRole: "Admin",
    action: "Driver Search",
    driverId: "DRV-012",
    result: "SUCCESS",
    details: "Search query executed",
  },
  {
    id: 6,
    timestamp: "2026-03-13 14:00:58",
    userRole: "Police",
    action: "Verification",
    driverId: "DRV-089",
    result: "TAMPERED",
    details: "Passport integrity check failed",
  },
  {
    id: 7,
    timestamp: "2026-03-13 13:55:45",
    userRole: "Admin",
    action: "User Management",
    driverId: "N/A",
    result: "SUCCESS",
    details: "New police officer account created",
  },
  {
    id: 8,
    timestamp: "2026-03-13 13:50:33",
    userRole: "Driver",
    action: "Passport View",
    driverId: "DRV-067",
    result: "SUCCESS",
    details: "Digital passport accessed",
  },
];

export function SystemLogs() {
  const [filter, setFilter] = useState<"all" | "verification" | "passport" | "user">("all");

  const filteredLogs = mockLogs.filter((log) => {
    if (filter === "all") return true;
    if (filter === "verification") return log.action === "Verification";
    if (filter === "passport") return log.action.includes("Passport");
    if (filter === "user") return log.action.includes("Login") || log.action.includes("User");
    return true;
  });

  const getResultIcon = (result: string) => {
    if (result === "VALID" || result === "SUCCESS") {
      return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
    }
    if (result === "EXPIRED") {
      return <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
    }
    return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
  };

  const getResultColor = (result: string) => {
    if (result === "VALID" || result === "SUCCESS") {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
    }
    if (result === "EXPIRED") {
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
    }
    return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
  };

  const getRoleColor = (role: string) => {
    if (role === "Police") {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
    }
    if (role === "Admin") {
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
    }
    if (role === "Driver") {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
    }
    return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            System Logs
          </h1>
          <p className="text-muted-foreground">
            Verification and activity logs
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Driver ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(log.userRole)}`}>
                      {log.userRole}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {log.driverId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getResultIcon(log.result)}
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResultColor(log.result)}`}>
                        {log.result}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}