import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Calendar, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { AnalyticsCard } from "../../components/AnalyticsCard";
import { RiskGauge } from "../../components/RiskGauge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import API_BASE_URL from "../../../config/api";

interface DriverProfile {
  full_name:  string;
  driver_id:  string;
  phone:      string;
  address:    string;
  username:   string;
}

interface DriverStats {
  total_points:  number;
  clean_days:    number;
  active_count:  number;
  total_count:   number;
  is_suspended:  boolean;
}

interface Offence {
  offence_date: string;
  points:       number;
  status:       string;
}

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
  const suffix = driverId?.split("-")[2] || "AB123";
  return `MU/2026/${suffix.slice(0, 6)}`;
}

export function DriverDetailsPage() {
  const { driverId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile]     = useState<DriverProfile | null>(null);
  const [stats, setStats]         = useState<DriverStats | null>(null);
  const [trendData, setTrendData] = useState<{ month: string; risk: number }[]>([]);
  const [loading, setLoading]     = useState(true);

  const fetchData = async () => {
    if (!driverId) return;
    setLoading(true);
    try {
      // Step 1 — find the username for this driver_id from admin/users
      const usersRes = await fetch(`${API_BASE_URL}/admin/users`);
      let username = "";
      if (usersRes.ok) {
        const data = await usersRes.json();
        const match = (data.drivers || []).find((d: any) => d.driver_id === driverId);
        if (match) username = match.username;
      }

      // Step 2 — fetch profile, stats, offences in parallel
      const [statsRes, offencesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/driver-stats/${driverId}`),
        fetch(`${API_BASE_URL}/offences/${driverId}`),
      ]);

      if (statsRes.ok)    setStats(await statsRes.json());
      if (offencesRes.ok) {
        const data = await offencesRes.json();
        setTrendData(buildTrendData(data.offences || []));
      }

      // Step 3 — fetch profile if we found a username
      if (username) {
        const profileRes = await fetch(`${API_BASE_URL}/profile/${username}`);
        if (profileRes.ok) setProfile(await profileRes.json());
      }

    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [driverId]);

  const totalPoints  = stats?.total_points  ?? 0;
  const cleanDays    = stats?.clean_days    ?? 0;
  const isCompliant  = !(stats?.is_suspended ?? false);
  const suspRisk     = Math.min(Math.round((totalPoints / 12) * 100), 100);
  const stabilityIdx = Math.max(100 - suspRisk, 0);
  const trustPct     = stabilityIdx;
  const trustLabel   = trustPct >= 75 ? "High" : trustPct >= 50 ? "Medium" : "Low";
  const licenceNumber = generateLicenceNumber(driverId || "");

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
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/admin/search")}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {loading ? "Loading..." : profile?.full_name || "Driver Details"}
          </h1>
          <p className="text-muted-foreground font-mono">ID: {driverId}</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading driver data...
        </div>
      )}

      {!loading && (
        <>
          {/* Driver Information Card */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">Driver Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Driver ID</p>
                <p className="text-lg font-semibold text-foreground font-mono">{driverId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Licence Number</p>
                <p className="text-lg font-semibold text-foreground">{licenceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isCompliant
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                }`}>
                  {isCompliant ? "COMPLIANT" : "SUSPENDED"}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trust Level</p>
                <p className="text-lg font-semibold text-foreground">{trustLabel} ({trustPct}%)</p>
              </div>
            </div>

            {/* Extra profile info if available */}
            {profile && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="text-sm font-medium text-foreground">{profile.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{profile.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-sm font-medium text-foreground">{profile.address || "—"}</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Behaviour Risk Panel */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">AI Behaviour Risk Assessment</h2>
            <div className="flex justify-center">
              <RiskGauge value={suspRisk} label="Suspension Risk (6 months)" />
            </div>
          </div>

          {/* Behaviour Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnalyticsCard
              title="Stability Index"
              value={`${stabilityIdx}%`}
              icon={Shield}
              trend={stabilityIdx >= 80 ? "Excellent" : stabilityIdx >= 50 ? "Moderate" : "Poor"}
              trendUp={stabilityIdx >= 80}
            />
            <AnalyticsCard
              title="Days Since Last Offence"
              value={String(cleanDays)}
              icon={Calendar}
              trend={cleanDays > 90 ? "Great streak!" : cleanDays > 30 ? "Keep it up" : "Recent offence"}
              trendUp={cleanDays > 30}
            />
            <AnalyticsCard
              title="Behaviour Trend"
              value={trendLabel}
              icon={TrendIcon}
              trend={`${totalPoints}/12 penalty points`}
              trendUp={trendUp}
            />
          </div>

          {/* Behaviour Trend Chart */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-6">Behaviour Risk Trend</h2>
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
          </div>
        </>
      )}
    </div>
  );
}