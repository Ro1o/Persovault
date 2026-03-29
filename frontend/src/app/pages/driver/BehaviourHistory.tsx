import { Shield, TrendingDown, Calendar, AlertTriangle, CheckCircle, XCircle, Navigation, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import API_BASE_URL, { apiFetch } from "../../../config/api";

// ── NEW: interfaces ───────────────────────────────────────────
interface Offence {
  id:           number;
  title:        string;
  description:  string;
  location:     string;
  severity:     string;
  points:       number;
  status:       string;
  offence_date: string;
}

interface DriverStats {
  total_points: number;
  clean_days:   number;
  active_count: number;
  total_count:  number;
}

// ── NEW: build 7-month trend from real offences ───────────────
function buildTrendData(offences: Offence[]) {
  const months = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("default", { month: "short" });
    const year  = d.getFullYear();
    const month = d.getMonth();

    const count = offences.filter(o => {
      const od = new Date(o.offence_date);
      return od.getFullYear() < year || (od.getFullYear() === year && od.getMonth() <= month);
    }).length;

    months.push({ month: label, risk: Math.min(count * 5, 100) });
  }
  return months;
}

const SEVERITY_COLORS: Record<string, string> = {
  minor:    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400",
  moderate: "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400",
  severe:   "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400",
};

export function BehaviourHistory() {

  // ── NEW: state ────────────────────────────────────────────
  const [offences, setOffences]   = useState<Offence[]>([]);
  const [stats, setStats]         = useState<DriverStats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [trendData, setTrendData] = useState<{ month: string; risk: number }[]>([]);

  const user     = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const driverId = user.driver_id;

  // ── NEW: fetch real data ──────────────────────────────────
  const fetchData = async () => {
    if (!driverId) { setLoading(false); return; }
    setLoading(true);
    try {
      const [offencesRes, statsRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/offences/${driverId}`),
        apiFetch(`${API_BASE_URL}/driver-stats/${driverId}`),
      ]);

      if (offencesRes.ok) {
        const data = await offencesRes.json();
        setOffences(data.offences || []);
        setTrendData(buildTrendData(data.offences || []));
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch {
      setStats({ total_points: 0, clean_days: 0, active_count: 0, total_count: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── NEW: derived values replacing hardcoded numbers ───────
  const totalPoints  = stats?.total_points ?? 0;
  const cleanDays    = stats?.clean_days   ?? 0;
  const suspRisk     = Math.min(Math.round((totalPoints / 12) * 100), 100);
  const stabilityIdx = Math.max(100 - suspRisk, 0);
  const lineColor    = suspRisk <= 30 ? "#22c55e" : suspRisk <= 60 ? "#f97316" : "#ef4444";

  return (
    <div className="space-y-6">

      {/* Header — added refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Behaviour History</h1>
          <p className="text-muted-foreground">Track your driving behaviour and offence history</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Behaviour Summary Cards — now uses real data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Stability Index</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{stabilityIdx}%</p>
          <p className={`text-sm mt-1 ${
            stabilityIdx >= 80 ? "text-green-600 dark:text-green-400"
            : stabilityIdx >= 50 ? "text-orange-600 dark:text-orange-400"
            : "text-red-600 dark:text-red-400"
          }`}>
            {stabilityIdx >= 80 ? "Excellent" : stabilityIdx >= 50 ? "Moderate" : "Poor"}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Penalty Points</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalPoints} / 12</p>
          <p className={`text-sm mt-1 ${
            12 - totalPoints <= 2 ? "text-red-600 dark:text-red-400"
            : "text-orange-600 dark:text-orange-400"
          }`}>
            {12 - totalPoints} points remaining
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Clean Driving Days</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{cleanDays}</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            {offences.length === 0 ? "No offences on record" : "Since last offence"}
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Suspension Risk</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{suspRisk}%</p>
          <p className={`text-sm mt-1 ${
            suspRisk <= 30 ? "text-green-600 dark:text-green-400"
            : suspRisk <= 60 ? "text-orange-600 dark:text-orange-400"
            : "text-red-600 dark:text-red-400"
          }`}>
            {suspRisk <= 30 ? "Decreasing" : suspRisk <= 60 ? "Moderate" : "High Risk"}
          </p>
        </div>
      </div>

      {/* AI Behaviour Trend Chart — now uses real trend data */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">AI Behaviour Risk Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-muted-foreground" />
            <YAxis
              className="text-muted-foreground"
              label={{ value: "Risk %", angle: -90, position: "insideLeft" }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="risk"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ fill: lineColor, r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          {offences.length === 0
            ? "No offences recorded — excellent driving behaviour!"
            : `Based on ${offences.length} recorded offence${offences.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Behaviour Timeline — now uses real offences */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">Offence History Timeline</h2>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading offences...
          </div>
        )}

        {/* Empty state */}
        {!loading && offences.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold text-foreground">No offences on record</p>
            <p className="text-sm text-muted-foreground mt-1">Keep up the excellent driving behaviour!</p>
          </div>
        )}

        {/* Real offence list */}
        {!loading && offences.length > 0 && (
          <div className="space-y-6">
            {offences.map((event, index) => (
              <div key={event.id} className="relative">
                {index !== offences.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border"></div>
                )}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      event.status === "expired"
                        ? "bg-gray-100 dark:bg-gray-900"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}>
                      {event.status === "expired"
                        ? <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      }
                    </div>
                  </div>

                  <div className={`flex-1 pb-6 ${event.status === "expired" ? "opacity-60" : ""}`}>
                    <div className="bg-background rounded-lg p-4 border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.offence_date).toLocaleDateString("en-GB", {
                              day: "2-digit", month: "short", year: "numeric"
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            SEVERITY_COLORS[event.severity] || SEVERITY_COLORS.minor
                          }`}>
                            {event.severity}
                          </span>
                          {event.status === "expired" && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-400">
                              Expired
                            </span>
                          )}
                          {event.status === "active" && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-foreground mb-2">{event.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Navigation className="w-4 h-4" />
                          <span>Location: {event.location}</span>
                        </div>
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                          {event.points} point{event.points !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clean Period Banner — only shows when 30+ clean days */}
        {!loading && cleanDays > 30 && (
          <div className="mt-6 bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-900/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-400">Clean Driving Period</h3>
                <p className="text-sm text-green-800 dark:text-green-500 mt-1">
                  You've maintained clean driving behaviour for {cleanDays} consecutive days. Keep up the excellent work!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}