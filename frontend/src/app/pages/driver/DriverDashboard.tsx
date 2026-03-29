import { AnalyticsCard } from "../../components/AnalyticsCard";
import { RiskGauge } from "../../components/RiskGauge";
import { Shield, TrendingUp, TrendingDown, Minus, Calendar, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import API_BASE_URL, { apiFetch } from "../../../config/api";

interface Profile {
  full_name: string;
  driver_id: string;
  phone:     string;
  address:   string;
}

interface Stats {
  total_points:  number;
  clean_days:    number;
  active_count:  number;
  total_count:   number;
  is_suspended:  boolean;
}

interface Offence {
  offence_date: string;
  points:       number;
}

// Build 7-month risk trend from real offences
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

function generateLicenceNumber(driverId: string): string {
  const year   = new Date().getFullYear();
  const suffix = driverId?.split("-")[2] || "AB123";
  return `MU/${year}/${suffix.slice(0, 6)}`;
}

export function DriverDashboard() {

  const [profile, setProfile]     = useState<Profile | null>(null);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [trendData, setTrendData] = useState<{ month: string; risk: number }[]>([]);
  const [loading, setLoading]     = useState(true);

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      // Step 1 — Get profile
      const profileRes = await apiFetch(`${API_BASE_URL}/profile/${user.username}`);
      const profileData: Profile = profileRes.ok ? await profileRes.json() : {
        full_name: user.full_name || "—",
        driver_id: user.driver_id || "—",
        phone:     "—",
        address:   "—",
      };
      setProfile(profileData);

      const driverId = profileData.driver_id || user.driver_id;
      if (!driverId) return;

      // Step 2 — Get stats + offences in parallel
      const [statsRes, offencesRes] = await Promise.all([
  apiFetch(`${API_BASE_URL}/driver-stats/${driverId}`),
  apiFetch(`${API_BASE_URL}/offences/${driverId}`),
]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      if (offencesRes.ok) {
        const data = await offencesRes.json();
        setTrendData(buildTrendData(data.offences || []));
      }

    } catch {
      // Fallback — show user data from localStorage
      setProfile({
        full_name: user.full_name || "—",
        driver_id: user.driver_id || "—",
        phone:     "—",
        address:   "—",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Derived values
  const driverId      = profile?.driver_id  || user.driver_id || "—";
  const licenceNumber = generateLicenceNumber(driverId);
  const totalPoints   = stats?.total_points ?? 0;
  const cleanDays     = stats?.clean_days   ?? 0;
  const suspRisk      = Math.min(Math.round((totalPoints / 12) * 100), 100);
  const stabilityIdx  = Math.max(100 - suspRisk, 0);
  const trustPct      = stabilityIdx;
  const isCompliant = !(stats?.is_suspended ?? false);

  const trustLabel = trustPct >= 75 ? "High" : trustPct >= 50 ? "Medium" : "Low";

  const trendLabel = (() => {
    if (trendData.length < 2) return "Stable";
    const first = trendData[0].risk;
    const last  = trendData[trendData.length - 1].risk;
    if (last < first) return "Improving";
    if (last > first) return "Worsening";
    return "Stable";
  })();

  const trendUp   = trendLabel === "Improving";
  const TrendIcon = trendLabel === "Improving" ? TrendingUp
                  : trendLabel === "Worsening" ? TrendingDown
                  : Minus;

  const lineColor = suspRisk <= 25 ? "#22c55e"
                  : suspRisk <= 60 ? "#f97316"
                  : "#ef4444";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Driver Dashboard</h1>
          <p className="text-muted-foreground">
            {loading ? "Loading..." : `Welcome back, ${profile?.full_name || user.full_name || "Driver"}`}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Driver Information Card */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">Driver Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Driver ID</p>
            <p className="text-lg font-semibold text-foreground font-mono">
              {loading ? "—" : driverId}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Licence Number</p>
            <p className="text-lg font-semibold text-foreground">
              {loading ? "—" : licenceNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Compliance Status</p>
            {loading ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isCompliant
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
              }`}>
                {isCompliant ? "COMPLIANT" : "SUSPENDED"}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trust Level</p>
            <p className="text-lg font-semibold text-foreground">
              {loading ? "—" : `${trustLabel} (${trustPct}%)`}
            </p>
          </div>
        </div>
      </div>

      {/* AI Behaviour Risk Panel */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">AI Behaviour Risk Assessment</h2>
        <div className="flex justify-center">
          {loading
            ? <div className="text-muted-foreground py-10">Loading risk data...</div>
            : <RiskGauge value={suspRisk} label="Suspension Risk (6 months)" />
          }
        </div>
      </div>

      {/* Behaviour Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Stability Index"
          value={loading ? "—" : `${stabilityIdx}%`}
          icon={Shield}
          trend={loading ? "" : stabilityIdx >= 80 ? "Excellent" : stabilityIdx >= 50 ? "Moderate" : "Poor"}
          trendUp={stabilityIdx >= 80}
        />
        <AnalyticsCard
          title="Days Since Last Offence"
          value={loading ? "—" : String(cleanDays)}
          icon={Calendar}
          trend={loading ? "" : cleanDays > 90 ? "Great streak!" : cleanDays > 30 ? "Keep it up" : "Recent offence"}
          trendUp={cleanDays > 30}
        />
        <AnalyticsCard
          title="Behaviour Trend"
          value={loading ? "—" : trendLabel}
          icon={TrendIcon}
          trend={loading ? "" : `${totalPoints}/12 penalty points`}
          trendUp={trendUp}
        />
      </div>

      {/* Behaviour Trend Chart */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">Behaviour Risk Trend</h2>
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-muted-foreground" stroke="currentColor" />
              <YAxis className="text-muted-foreground" stroke="currentColor" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="risk"
                stroke={lineColor}
                strokeWidth={3}
                dot={{ fill: lineColor, r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}