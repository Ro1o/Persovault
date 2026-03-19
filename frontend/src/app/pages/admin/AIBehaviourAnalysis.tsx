import { Brain } from "lucide-react";
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

export function AIBehaviourAnalysis() {

const [riskScore, setRiskScore] = useState<number | null>(null);
const [riskLevel, setRiskLevel] = useState("Loading...");

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

} catch (error) {

  console.error("AI prediction failed:", error);
  setRiskLevel("Error");

}

}

async function loadAnalytics() {

try {

  /* Simulated drivers for dashboard analytics */


  const result = await getAnalytics();

  const riskData = [
    { name: "Low Risk", value: result.risk_distribution.LOW },
    { name: "Medium Risk", value: result.risk_distribution.MEDIUM },
    { name: "High Risk", value: result.risk_distribution.HIGH }
  ];

  const offenceData = [
    { category: "Minor", count: result.offence_distribution.minor },
    { category: "Moderate", count: result.offence_distribution.moderate },
    { category: "Severe", count: result.offence_distribution.severe }
  ];

  setRiskDistribution(riskData);
  setOffenceDistribution(offenceData);

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

useEffect(() => {

runAIAnalysis();
loadAnalytics();
loadFeatureImportance();

}, []);




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



  {/* AI Prediction */}

  <div className="bg-card rounded-lg p-6 border border-border shadow-sm">

    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
      <Brain className="w-5 h-5 text-primary" />
      AI Risk Prediction
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Risk Score
        </p>

        <p className="text-3xl font-bold text-primary">
          {riskScore !== null ? `${(riskScore * 100).toFixed(1)}%` : "Loading..."}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Risk Level
        </p>

        <p className="text-3xl font-bold text-foreground">
          {riskLevel}
        </p>
      </div>

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



  {/* Explainable AI */}

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