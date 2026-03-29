import { useState, useEffect } from "react";
import { Filter, CheckCircle2, XCircle, Shield, RefreshCw } from "lucide-react";
import API_BASE_URL, { apiFetch } from "../../../config/api";

interface AuditLog {
  action:     string;
  username:   string;
  nic_number: string;
  ip_address: string;
  result:     string;
  details:    string;
  timestamp:  string;
}

type FilterType = "all" | "registration" | "verification" | "blocked";

export function SystemLogs() {
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<FilterType>("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/audit-log?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.audit_log || []);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(log => {
    if (filter === "all")          return true;
    if (filter === "registration") return log.action.includes("REGISTRATION");
    if (filter === "verification") return log.action.includes("SIGNATURE");
    if (filter === "blocked")      return log.action.includes("BLOCKED") || log.result === "FRAUDULENT";
    return true;
  });

  const getResultIcon = (result: string) => {
    if (!result) return <Shield className="w-4 h-4 text-gray-400" />;
    const r = result.toUpperCase();
    if (r === "VERIFIED" || r === "SUCCESS" || r === "VALID" || r === "LOW RISK")
      return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
    if (r === "BLOCKED" || r === "FRAUDULENT" || r === "FAILED")
      return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
    return <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />;
  };

  const getResultColor = (result: string) => {
    if (!result) return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    const r = result.toUpperCase();
    if (r === "VERIFIED" || r === "SUCCESS" || r === "VALID" || r === "LOW RISK")
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
    if (r === "BLOCKED" || r === "FRAUDULENT" || r === "FAILED")
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
  };

  const getActionColor = (action: string) => {
    if (action.includes("SUCCESS"))  return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
    if (action.includes("BLOCKED") || action.includes("FAILED"))
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
    if (action.includes("VERIFIED")) return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
    return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  };

  const formatTimestamp = (ts: string) => {
    try {
      return new Date(ts).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  const FILTERS: { label: string; value: FilterType; count: number }[] = [
    { label: "All",           value: "all",          count: logs.length },
    { label: "Registrations", value: "registration", count: logs.filter(l => l.action.includes("REGISTRATION")).length },
    { label: "Verifications", value: "verification", count: logs.filter(l => l.action.includes("SIGNATURE")).length },
    { label: "Blocked",       value: "blocked",      count: logs.filter(l => l.action.includes("BLOCKED") || l.result === "FRAUDULENT").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">System Logs</h1>
          <p className="text-muted-foreground">NIC security audit trail — immutable forensic log</p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              filter === f.value
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-card border border-border text-muted-foreground hover:bg-accent"
            }`}
          >
            <Filter className="w-3 h-3" />
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === f.value ? "bg-white/20 dark:bg-black/20" : "bg-muted"
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading audit logs...
        </div>
      )}

      {/* Logs Table */}
      {!loading && (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  {["Timestamp", "Action", "Username", "NIC Number", "IP Address", "Result", "Details"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      No log entries found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-accent transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {log.username || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                        {log.nic_number || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                        {log.ip_address || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getResultIcon(log.result)}
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getResultColor(log.result)}`}>
                            {log.result || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {log.details || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filteredLogs.length > 0 && (
            <div className="px-6 py-3 bg-muted text-xs text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} log entries
            </div>
          )}
        </div>
      )}

      {/* Empty state when no NIC actions yet */}
      {!loading && logs.length === 0 && (
        <div className="bg-card rounded-lg p-8 border border-border text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground mb-1">No audit logs yet</p>
          <p className="text-sm text-muted-foreground">
            Logs are generated when drivers register or verify their NIC.
          </p>
        </div>
      )}
    </div>
  );
}