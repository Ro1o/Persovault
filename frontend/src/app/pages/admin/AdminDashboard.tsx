import { AnalyticsCard } from "../../components/AnalyticsCard";
import { Users, AlertTriangle, CreditCard, ScanLine, RefreshCw, Shield } from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import API_BASE_URL, { apiFetch } from "../../../config/api";

interface AdminStats {
  total_drivers:          number;
  total_police:           number;
  total_admins:           number;
  suspended_drivers:      number;
  high_risk_drivers:      number;
  medium_risk_drivers:    number;
  low_risk_drivers:       number;
  total_active_offences:  number;
  total_nic_registered:   number;
  nic_alerts:             number;
  offence_trend:          { month: string; offences: number }[];
}

interface FeatureImportance {
  feature:    string;
  importance: number;
}

export function AdminDashboard() {

  const [stats, setStats]       = useState<AdminStats | null>(null);
  const [features, setFeatures] = useState<FeatureImportance[]>([]);
  const [loading, setLoading]   = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, featuresRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/admin/stats`),
        apiFetch(`${API_BASE_URL}/feature-importance`),
      ]);

      if (statsRes.ok)    setStats(await statsRes.json());
      if (featuresRes.ok) {
        const data = await featuresRes.json();
        setFeatures(data.feature_importance || []);
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Build pie chart from real stats
  const riskDistributionData = stats ? [
    { id: "low",       name: "Low Risk",   value: stats.low_risk_drivers,    color: "#16a34a" },
    { id: "medium",    name: "Medium Risk", value: stats.medium_risk_drivers,  color: "#ca8a04" },
    { id: "high",      name: "High Risk",  value: stats.high_risk_drivers,    color: "#f97316" },
    { id: "suspended", name: "Suspended",  value: stats.suspended_drivers,    color: "#dc2626" },
  ].filter(d => d.value > 0) : [];

  // Feature importance → top 5 risk factors from real model
  const topRiskFactors = features.slice(0, 5).map(f => ({
    id:     f.feature,
    factor: f.feature.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    impact: Math.round(f.importance * 100),
  }));

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">System-wide monitoring and analytics</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Drivers"
          value={loading ? "—" : String(stats?.total_drivers ?? 0)}
          icon={Users}
          trend={loading ? "" : `${stats?.suspended_drivers ?? 0} suspended`}
          trendUp={false}
        />
        <AnalyticsCard
          title="High Risk Drivers"
          value={loading ? "—" : String(stats?.high_risk_drivers ?? 0)}
          icon={AlertTriangle}
          trend={loading ? "" : `${stats?.suspended_drivers ?? 0} already suspended`}
          trendUp={false}
        />
        <AnalyticsCard
          title="NIC Registered"
          value={loading ? "—" : String(stats?.total_nic_registered ?? 0)}
          icon={CreditCard}
          trend={loading ? "" : `${stats?.nic_alerts ?? 0} fraud alerts`}
          trendUp={false}
        />
        <AnalyticsCard
          title="Active Offences"
          value={loading ? "—" : String(stats?.total_active_offences ?? 0)}
          icon={ScanLine}
          trend={loading ? "" : `${stats?.total_police ?? 0} police officers`}
          trendUp={false}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Risk Distribution Pie — real data */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Suspension Risk Distribution
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {riskDistributionData.map(entry => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Offence Trend — real data */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Offence Trend (Last 7 Months)
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.offence_trend || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-muted-foreground" stroke="currentColor" />
                <YAxis className="text-muted-foreground" stroke="currentColor" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="offences"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ fill: "#4F46E5", r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Risk Factors — real from feature_importance.csv */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Top Risk Factors (Explainable AI)
        </h2>
        <p className="text-xs text-muted-foreground mb-6">
          Feature importance from trained model — <code>ai/feature_importance.csv</code>
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : topRiskFactors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No data found. Run <code>python ai/train_model.py</code> to generate feature importance.
          </p>
        ) : (
          <div className="space-y-4">
            {topRiskFactors.map(factor => (
              <div key={factor.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-foreground">{factor.factor}</span>
                  <span className="text-sm text-muted-foreground">{factor.impact}% impact</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${factor.impact}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}