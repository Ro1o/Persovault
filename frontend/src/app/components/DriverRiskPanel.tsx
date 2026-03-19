import { Brain } from "lucide-react";
import { useEffect, useState } from "react";
import GaugeChart from "react-gauge-chart";
import { predictRisk } from "../../services/aiService";

interface DriverData {
driver_id: string;
current_points: number;
previous_points: number;
offences_last_12m: number;
minor_offences: number;
moderate_offences: number;
severe_offences: number;
days_since_last_offence: number;
avg_days_between_offences: number;
years_since_licence_issue: number;
last_sync: string;
}

interface RiskResult {
risk_score: number;
risk_level: string;
behaviour_score?: number;
trend?: string;
}

export function DriverRiskPanel({ driver }: { driver: DriverData }) {

const [riskScore, setRiskScore] = useState<number | null>(null);
const [riskLevel, setRiskLevel] = useState("Loading...");
const [behaviourScore, setBehaviourScore] = useState<number | null>(null);
const [trend, setTrend] = useState("");

async function loadRisk() {

try {

  const result: RiskResult = await predictRisk(driver);

  if (!result) return;

  console.log("AI RESULT:", result);

  setRiskScore(result.risk_score);
  setRiskLevel(result.risk_level);
  setBehaviourScore(result.behaviour_score ?? null);
  setTrend(result.trend ?? "");

} catch (error) {

  console.error("Risk prediction failed", error);
  setRiskLevel("Error");

}

}

useEffect(() => {
loadRisk();
}, [driver]);

/* Behaviour Score Status */

function getBehaviourStatus(score: number | null) {

if (score === null)
  return { label: "Loading...", color: "text-gray-500" };

if (score >= 80)
  return { label: "SAFE DRIVER", color: "text-green-600" };

if (score >= 60)
  return { label: "MODERATE RISK", color: "text-yellow-600" };

return { label: "HIGH RISK", color: "text-red-600" };

}

const behaviourStatus = getBehaviourStatus(behaviourScore);

return (

<div className="bg-card rounded-lg p-6 border border-border shadow-sm">

  <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
    <Brain className="w-5 h-5 text-primary" />
    AI Behaviour Risk
  </h2>


  {/* Risk Gauge */}

  <div className="mb-8">

    <GaugeChart
      id="risk-gauge"
      nrOfLevels={3}
      percent={riskScore ?? 0}
      colors={["#16a34a", "#eab308", "#dc2626"]}
      arcWidth={0.3}
      textColor="#000"
    />

  </div>


  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

    {/* Risk Score */}
    <div>
      <p className="text-sm text-muted-foreground">Risk Score</p>

      <p className="text-3xl font-bold text-primary">
        {riskScore !== null
          ? `${(riskScore * 100).toFixed(1)}%`
          : "Loading..."}
      </p>
    </div>


    {/* Risk Level */}
    <div>
      <p className="text-sm text-muted-foreground">Risk Level</p>

      <p className="text-3xl font-bold text-foreground">
        {riskLevel}
      </p>
    </div>


    {/* Behaviour Score */}
    <div>
      <p className="text-sm text-muted-foreground">Behaviour Score</p>

      <p className="text-3xl font-bold">
        {behaviourScore !== null
          ? `${behaviourScore} / 100`
          : "Loading..."}
      </p>

      <p className={`text-sm font-semibold ${behaviourStatus.color}`}>
        {behaviourStatus.label}
      </p>
    </div>


    {/* Trend */}
    <div>
      <p className="text-sm text-muted-foreground">Trend</p>

      <p className="text-3xl font-bold text-blue-600">
        {trend || "Loading..."}
      </p>
    </div>

  </div>

</div>

);

}