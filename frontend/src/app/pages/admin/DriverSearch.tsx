import { useState, useEffect } from "react";
import { Search, User, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { apiFetch } from "../../../config/api";

interface Driver {
  username:        string;
  full_name:       string;
  driver_id:       string;
  licence_number:  string;
  total_points:    number;
  active_offences: number;
  risk_level:      string;
  compliance:      string;
  is_suspended:    boolean;
  last_update:     string;
}

export function DriverSearch() {
  const [drivers, setDrivers]       = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading]       = useState(true);
  const navigate = useNavigate();

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/admin/users`);
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers || []);
      }
    } catch {
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const filteredDrivers = drivers.filter(d =>
    d.driver_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.licence_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    if (risk === "Low")       return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
    if (risk === "Medium")    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
    if (risk === "High")      return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400";
    if (risk === "Suspended") return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
    return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  };

  const getComplianceColor = (status: string) => {
    if (status === "COMPLIANT") return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
    return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Driver Search</h1>
          <p className="text-muted-foreground">Search and manage driver records</p>
        </div>
        <button
          onClick={fetchDrivers}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by driver ID, name, username or licence number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading drivers...
        </div>
      )}

      {/* Results Table */}
      {!loading && (
        <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  {["Driver ID", "Name", "Licence Number", "Points", "Compliance", "Risk Level", "Last Offence", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">
                      {searchQuery ? "No drivers match your search." : "No drivers found."}
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map(driver => (
                    <tr key={driver.driver_id} className="hover:bg-primary/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-foreground">
                        {driver.driver_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-foreground">{driver.full_name}</div>
                            <div className="text-xs text-muted-foreground">{driver.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-mono">
                        {driver.licence_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span className={driver.total_points >= 12 ? "text-red-600 dark:text-red-400" :
                          driver.total_points >= 8 ? "text-orange-600 dark:text-orange-400" :
                          "text-foreground"}>
                          {driver.total_points} / 12
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getComplianceColor(driver.compliance)}`}>
                          {driver.compliance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(driver.risk_level)}`}>
                          {driver.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                        {driver.last_update !== "No offences" 
                          ? new Date(driver.last_update).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                          : "Clean record"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/app/admin/driver/${driver.driver_id}`)}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && filteredDrivers.length > 0 && (
            <div className="px-6 py-3 bg-muted text-xs text-muted-foreground">
              Showing {filteredDrivers.length} of {drivers.length} drivers
            </div>
          )}
        </div>
      )}
    </div>
  );
}