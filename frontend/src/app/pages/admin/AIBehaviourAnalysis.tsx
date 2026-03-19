import { Brain, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import { useEffect, useState } from "react";
import { predictRisk, getFeatureImportance } from "../../../services/aiService";
import { getAnalytics } from "../../../services/analyticsService";

// ── Explanation Generator ─────────────────────────────────────────────────────

function generateExplanation(
  riskScore: number,
  riskLevel: string,
  trend: string,
  featureImportance: any[]
) {
  const lines: string[] = [];

  // 1. Overall risk summary
  if (riskLevel === "HIGH") {
    lines.push(`⚠️ This driver has a high suspension risk of ${(riskScore * 100).toFixed(1)}%, indicating serious behavioural concerns.`);
  } else if (riskLevel === "MEDIUM") {
    lines.push(`🔶 This driver has a moderate suspension risk of ${(riskScore * 100).toFixed(1)}%. Behaviour should be monitored closely.`);
  } else {
    lines.push(`✅ This driver has a low suspension risk of ${(riskScore * 100).toFixed(1)}%, indicating responsible driving behaviour.`);
  }

  // 2. Trend analysis
  if (trend === "WORSENING") {
    lines.push("📈 Driving behaviour is showing a worsening trend — offences have been increasing recently.");
  } else if (trend === "IMPROVING") {
    lines.push("📉 Driving behaviour is improving — the driver has shown fewer offences over time.");
  } else {
    lines.push("➡️ Driving behaviour has been stable with no significant changes detected.");
  }

  // 3. Top risk factors from feature importance
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

  // 4. Recommendation
  if (riskLevel === "HIGH") {
    lines.push("💡 Recommendation: Immediate intervention advised. Driver should attend a behavioural awareness programme.");
  } else if (riskLevel === "MEDIUM") {
    lines.push("💡 Recommendation: Monitor driving behaviour over the next 3 months. Avoid any further offences.");
  } else {
    lines.push("💡 Recommendation: Continue safe driving practices to maintain low risk status.");
  }

  return lines;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AIBehaviourAnalysis() {

  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState("Loading...");
  const [trend, setTrend] = useState("STABLE");
  const [explanation, setExplanation] = useState<string[]>([]);

  const [riskDistribution, setRiskDistribution] = useState<any[]>([]);
  const [offenceDistribution, setOffenceDistribution] = useState<any[]>([]);
  const [featureImportance, setFeatureImportance] = useState<any[]>([]);

  const COLORS = ["#16a34a", "#ca8a04", "#dc2626"];

  const suspensionProbabilityData = [
    { month: "Sep", probability: 18 },
    { month: "Oct", probability: 16 },
    { month: "Nov", probability: 15 },
    { month: "Dec", probability: 14 },
    { month: "Jan", probability: 12 },
    { month: "Feb", probability: 11 },
    { month: "Mar", probability: 10 },
  ];

  async function runAIAnalysis() {
    try {
      const result = await predictRisk({
        driver_id: "DRV001",
        current_points: 6,
        previous_points: 4,
        offences_last_12m: 3,
        minor_offences: 1,
        moderate_offences: 1,
        severe_offences: 1,
        days_since_last_offence: 45,
        avg_days_between_offences: 120,
        years_since_licence_issue: 8,
        last_sync: new Date().toISOString()
      });

      setRiskScore(result.risk_score);
      setRiskLevel(result.risk_level);
      setTrend(result.trend || "STABLE");

    } catch (error) {
      console.error("AI prediction failed:", error);
      setRiskLevel("Error");
    }
  }

  async function loadAnalytics() {
    try {
      const result = await getAnalytics();

      setRiskDistribution([
        { name: "Low Risk",    value: result.risk_distribution.LOW },
        { name: "Medium Risk", value: result.risk_distribution.MEDIUM },
        { name: "High Risk",   value: result.risk_distribution.HIGH }
      ]);

      setOffenceDistribution([
        { category: "Minor",    count: result.offence_distribution.minor },
        { category: "Moderate", count: result.offence_distribution.moderate },
        { category: "Severe",   count: result.offence_distribution.severe }
      ]);

    } catch (error) {
      console.error("Analytics loading failed:", error);
    }
  }

  async function loadFeatureImportance() {
    try {
      const result = await getFeatureImportance();
      setFeatureImportance(result);
    } catch (error) {
      console.error("Feature importance loading failed:", error);
    }
  }

  // Generate explanation once all data is loaded
  useEffect(() => {
    if (riskScore !== null && riskLevel !== "Loading..." && riskLevel !== "Error") {
      const lines = generateExplanation(riskScore, riskLevel, trend, featureImportance);
      setExplanation(lines);
    }
  }, [riskScore, riskLevel, trend, featureImportance]);

  useEffect(() => {
    runAIAnalysis();
    loadAnalytics();
    loadFeatureImportance();
  }, []);

  // Risk level color helper
  const riskColor = {
    HIGH:    "text-red-500",
    MEDIUM:  "text-yellow-500",
    LOW:     "text-green-500",
  }[riskLevel] ?? "text-foreground";

  const riskBg = {
    HIGH:    "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    MEDIUM:  "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    LOW:     "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  }[riskLevel] ?? "bg-card border-border";

  const TrendIcon = trend === "WORSENING" ? TrendingUp
    : trend === "IMPROVING" ? TrendingDown
    : Minus;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          AI Behaviour Analysis
        </h1>
        <p className="text-muted-foreground">
          System-wide predictive analytics and insights
        </p>
      </div>

      {/* AI Prediction + Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Risk Score Card */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Risk Prediction
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
              <p className={`text-3xl font-bold ${riskColor}`}>
                {riskScore !== null ? `${(riskScore * 100).toFixed(1)}%` : "Loading..."}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Risk Level</p>
              <p className={`text-3xl font-bold ${riskColor}`}>
                {riskLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendIcon className="w-4 h-4" />
            <span>Trend: <span className="font-medium text-foreground">{trend}</span></span>
          </div>
        </div>

        {/* Explanation Card */}
        <div className={`rounded-lg p-6 border shadow-sm ${riskBg}`}>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            {riskLevel === "HIGH" ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            AI Explanation
          </h2>

          {explanation.length > 0 ? (
            <ul className="space-y-3">
              {explanation.map((line, i) => (
                <li key={i} className="text-sm text-foreground leading-relaxed">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Generating explanation...</p>
          )}
        </div>

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Risk Distribution */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Risk Level Distribution
          </h2>
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
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Offence Distribution */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Offence Category Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={offenceDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="category" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip />
              <Bar dataKey="count" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Suspension Probability */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Suspension Probability Trends
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={suspensionProbabilityData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="probability"
              stroke="#4F46E5"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Explainable AI - Feature Importance */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          AI Risk Factors (Explainable AI)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={featureImportance}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="feature" stroke="currentColor" />
            <YAxis stroke="currentColor" />
            <Tooltip />
            <Bar dataKey="importance" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}