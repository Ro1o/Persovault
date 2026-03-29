import { useState, useEffect } from "react";
import { Users, Plus, Shield, RefreshCw, Search } from "lucide-react";
import API_BASE_URL, { apiFetch } from "../../../config/api";

interface User {
  username:        string;
  full_name:       string;
  driver_id:       string | null;
  role:            string;
  total_points?:   number;
  compliance?:     string;
  is_suspended?:   boolean;
  last_update?:    string;
}

interface AdminStats {
  total_drivers:  number;
  total_police:   number;
  total_admins:   number;
}

export function UserManagement() {
  const [users, setUsers]         = useState<User[]>([]);
  const [stats, setStats]         = useState<AdminStats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [searchQuery, setSearch]  = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "driver" | "police" | "admin">("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/admin/users`),
        apiFetch(`${API_BASE_URL}/admin/stats`),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        // drivers come from /admin/users
        const drivers: User[] = (data.drivers || []).map((d: any) => ({
          username:      d.username,
          full_name:     d.full_name,
          driver_id:     d.driver_id,
          role:          "driver",
          total_points:  d.total_points,
          compliance:    d.compliance,
          is_suspended:  d.is_suspended,
          last_update:   d.last_update,
        }));
        setUsers(drivers);
      }

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = users.filter(u => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.driver_id || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  const getRoleBadgeColor = (role: string) => {
    if (role === "admin")  return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400";
    if (role === "police") return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400";
    return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
  };

  const getStatusBadge = (user: User) => {
    if (user.is_suspended)
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">Suspended</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Active</span>;
  };

  const totalUsers = (stats?.total_drivers ?? 0) + (stats?.total_police ?? 0) + (stats?.total_admins ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage system users and permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "—" : totalUsers}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Police Officers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "—" : stats?.total_police ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Administrators</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? "—" : stats?.total_admins ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, username or driver ID..."
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {(["all", "driver", "police", "admin"] as const).map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              roleFilter === r
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading users...
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  {["Username", "Full Name", "Driver ID", "Role", "Points", "Status", "Last Offence", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(user => (
                    <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                        {user.driver_id || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        {user.total_points !== undefined ? (
                          <span className={
                            (user.total_points ?? 0) >= 12 ? "text-red-600 dark:text-red-400" :
                            (user.total_points ?? 0) >= 8  ? "text-orange-600 dark:text-orange-400" :
                            "text-gray-900 dark:text-white"
                          }>
                            {user.total_points} / 12
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {user.last_update && user.last_update !== "No offences"
                          ? new Date(user.last_update).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                          : "Clean record"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-3">
                          Edit
                        </button>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500">
              Showing {filtered.length} of {users.length} users
            </div>
          )}
        </div>
      )}
    </div>
  );
}