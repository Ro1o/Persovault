import { Brain, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { useEffect, useState } from "react";
import { getFeatureImportance } from "../../../services/aiService";
import API_BASE_URL, { apiFetch } from "../../../config/api";
// ── Explanation Generator ─────────────────────────────────────────────────────
function generateExplanation(
  riskScore: number,
  riskLevel: string,
  trend: string,
  featureImportance: any[]
) {
  const lines: string[] = [];

  if (riskLevel === "HIGH") {
    lines.push(`⚠️ System-wide suspension risk is high at ${(riskScore * 100).toFixed(1)}%, indicating serious behavioural concerns across the driver population.`);
  } else if (riskLevel === "MEDIUM") {
    lines.push(`🔶 System-wide suspension risk is moderate at ${(riskScore * 100).toFixed(1)}%. Driver behaviour should be monitored closely.`);
  } else {
    lines.push(`✅ System-wide suspension risk is low at ${(riskScore * 100).toFixed(1)}%, indicating generally responsible driving behaviour.`);
  }

  if (trend === "WORSENING") {
    lines.push("📈 System-wide driving behaviour is showing a worsening trend — offences have been increasing recently.");
  } else if (trend === "IMPROVING") {
    lines.push("📉 System-wide driving behaviour is improving — fewer offences have been recorded over time.");
  } else {
    lines.push("➡️ System-wide driving behaviour has been stable with no significant changes detected.");
  }

  if (featureImportance.length > 0) {
    const top = featureImportance.slice(0, 3).map((f: any) => f.feature);
    const readable: Record<string, string> = {
      current_points:            "high current penalty points",
      offences_last_12m:         "frequent offences in the last 12 months",
      minor_offences:            "accumulation of minor offences",
      moderate_offences:         "multiple moderate offences",
      severe_offences:           "presence of severe offences",
      days_since_last_offence:   "recent offence activity",
      avg_days_between_offences: "short intervals between offences",
      years_since_licence_issue: "limited driving experience",
      suspension_proximity:      "proximity to suspension threshold",
      stability_index:           "low behavioural stability",
      trend_encoded:             "negative behavioural trend",
    };
    const factors = top.map((f: string) => readable[f] || f).join(", ");
    lines.push(`🔍 Key risk factors: ${factors}.`);
  }

  if (riskLevel === "HIGH") {
    lines.push("💡 Recommendation: Immediate intervention advised. High-risk drivers should be flagged for review.");
  } else if (riskLevel === "MEDIUM") {
    lines.push("💡 Recommendation: Monitor system-wide behaviour over the next 3 months.");
  } else {
    lines.push("💡 Recommendation: Continue enforcing safe driving standards to maintain low risk status.");
  }

  return lines;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AIBehaviourAnalysis() {

  const [riskScore, setRiskScore]                 = useState<number | null>(null);
  const [riskLevel, setRiskLevel]                 = useState("Loading...");
  const [trend, setTrend]                         = useState("STABLE");
  const [explanation, setExplanation]             = useState<string[]>([]);
  const [riskDistribution, setRiskDistribution]   = useState<any[]>([]);
  const [offenceDistribution, setOffenceDistribution] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);
  const [offenceTrend, setOffenceTrend]           = useState<any[]>([]);
  const [loading, setLoading]                     = useState(true);

  const COLORS = ["#16a34a", "#ca8a04", "#f97316", "#dc2626"];

  // ── NEW: fetch real admin stats then feed into AI ─────────────────────────
  async function runAnalysis() {
    setLoading(true);
    try {
      // Step 1 — get real system stats
      const statsRes = await apiFetch(`${API_BASE_URL}/admin/stats`);
      const stats = statsRes.ok ? await statsRes.json() : null;

      if (stats) {
        // Risk distribution from real counts
        setRiskDistribution([
          { name: "Low Risk",   value: stats.low_risk_drivers    },
          { name: "Medium Risk", value: stats.medium_risk_drivers },
          { name: "High Risk",  value: stats.high_risk_drivers   },
          { name: "Suspended",  value: stats.suspended_drivers   },
        ].filter(d => d.value > 0));

        // Offence trend from real monthly data
        setOffenceTrend(stats.offence_trend || []);

     
        // Use total_active_offences to estimate distribution
        const total = stats.total_active_offences || 0;
        setOffenceDistribution([
          { category: "Minor",    count: Math.round(total * 0.4) },
          { category: "Moderate", count: Math.round(total * 0.35) },
          { category: "Severe",   count: Math.round(total * 0.25) },
        ]);

        // Step 2 — build representative driver from system averages
        // Use aggregate stats to compute a "system average" driver profile
        const totalDrivers  = stats.total_drivers || 1;
        const avgPoints     = stats.total_active_offences > 0
          ? Math.min(Math.round((stats.high_risk_drivers * 9 + stats.medium_risk_drivers * 5 + stats.low_risk_drivers * 2) / totalDrivers), 14)
          : 0;
        const avgOffences   = stats.total_active_offences > 0
          ? Math.round(stats.total_active_offences / totalDrivers)
          : 0;
        const suspendedRatio = stats.suspended_drivers / totalDrivers;

        // Step 3 — call /predict-risk with real system-average driver
        const predictRes = await apiFetch(`${API_BASE_URL}/predict-risk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driver_id:                "SYSTEM-AVERAGE",
            current_points:           avgPoints,
            previous_points:          Math.max(avgPoints - 1, 0),
            offences_last_12m:        avgOffences,
            minor_offences:           Math.round(avgOffences * 0.4),
            moderate_offences:        Math.round(avgOffences * 0.35),
            severe_offences:          Math.round(avgOffences * 0.25),
            days_since_last_offence:  offenceTrend.length > 0 ? 30 : 180,
            avg_days_between_offences: avgOffences > 0 ? Math.round(365 / avgOffences) : 365,
            years_since_licence_issue: 5,
            last_sync:                new Date().toISOString(),
          }),
        });

        if (predictRes.ok) {
          const result = await predictRes.json();
          setRiskScore(result.risk_score);
          setRiskLevel(result.risk_level);
          // Determine trend from offence_trend data
          const trend = stats.offence_trend || [];
          if (trend.length >= 2) {
            const first = trend[0].offences;
            const last  = trend[trend.length - 1].offences;
            setTrend(last > first ? "WORSENING" : last < first ? "IMPROVING" : "STABLE");
          } else {
            setTrend(result.trend || "STABLE");
          }
        }
      }

      // Step 4 — load real feature importance from model
      const fi = await getFeatureImportance();
      setFeatureImportance(fi);

    } catch (error) {
      console.error("AI analysis failed:", error);
      setRiskLevel("Error");
    } finally {
      setLoading(false);
    }
  }

  // Generate explanation once all data is loaded
  useEffect(() => {
    if (riskScore !== null && riskLevel !== "Loading..." && riskLevel !== "Error") {
      const lines = generateExplanation(riskScore, riskLevel, trend, featureImportance);
      setExplanation(lines);
    }
  }, [riskScore, riskLevel, trend, featureImportance]);

  useEffect(() => { runAnalysis(); }, []);

  const riskColor = {
    HIGH:   "text-red-500",
    MEDIUM: "text-yellow-500",
    LOW:    "text-green-500",
  }[riskLevel] ?? "text-foreground";

  const riskBg = {
    HIGH:   "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    MEDIUM: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    LOW:    "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  }[riskLevel] ?? "bg-card border-border";

  const TrendIcon = trend === "WORSENING" ? TrendingUp
    : trend === "IMPROVING" ? TrendingDown
    : Minus;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Behaviour Analysis</h1>
          <p className="text-muted-foreground">System-wide predictive analytics and insights</p>
        </div>
        <button
          onClick={runAnalysis}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* AI Prediction + Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Risk Score Card */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Risk Prediction (System Average)
          </h2>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-6">
              <RefreshCw className="w-5 h-5 animate-spin" /> Analysing system data...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                  <p className={`text-3xl font-bold ${riskColor}`}>
                    {riskScore !== null ? `${(riskScore * 100).toFixed(1)}%` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
                  <p className={`text-3xl font-bold ${riskColor}`}>{riskLevel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendIcon className="w-4 h-4" />
                <span>Trend: <span className="font-medium text-foreground">{trend}</span></span>
              </div>
            </>
          )}
        </div>

        {/* Explanation Card */}
        <div className={`rounded-lg p-6 border shadow-sm ${loading ? "bg-card border-border" : riskBg}`}>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            {riskLevel === "HIGH"
              ? <AlertTriangle className="w-5 h-5 text-red-500" />
              : <CheckCircle className="w-5 h-5 text-green-500" />
            }
            AI Explanation
          </h2>
          {loading ? (
            <p className="text-sm text-muted-foreground">Generating explanation...</p>
          ) : explanation.length > 0 ? (
            <ul className="space-y-3">
              {explanation.map((line, i) => (
                <li key={i} className="text-sm text-foreground leading-relaxed">{line}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No data available.</p>
          )}
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Risk Distribution — real */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">Risk Level Distribution</h2>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                  }
                  isAnimationActive={false}
                >
                  {riskDistribution.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Offence Category Distribution */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">Offence Category Distribution</h2>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={offenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="category" stroke="currentColor" />
                <YAxis stroke="currentColor" />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* Offence Trend — real monthly data */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          System-Wide Offence Trend (Last 7 Months)
        </h2>
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={offenceTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip />
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

      {/* Feature Importance — real from model */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          AI Risk Factors (Explainable AI)
        </h2>
        {loading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="feature" stroke="currentColor" tick={{ fontSize: 10 }} />
              <YAxis stroke="currentColor" />
              <Tooltip />
              <Bar dataKey="importance" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  );
}