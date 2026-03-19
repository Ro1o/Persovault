import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Calendar, TrendingUp } from "lucide-react";
import { AnalyticsCard } from "../../components/AnalyticsCard";
import { RiskGauge } from "../../components/RiskGauge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const behaviourTrendData = [
  { month: "Sep", risk: 25 },
  { month: "Oct", risk: 22 },
  { month: "Nov", risk: 28 },
  { month: "Dec", risk: 24 },
  { month: "Jan", risk: 20 },
  { month: "Feb", risk: 18 },
  { month: "Mar", risk: 15 },
];

export function DriverDetailsPage() {
  const { driverId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/admin/search")}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Driver Details
          </h1>
          <p className="text-muted-foreground">
            ID: {driverId}
          </p>
        </div>
      </div>

      {/* Driver Information Card */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Driver Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Driver ID</p>
            <p className="text-lg font-semibold text-foreground">DRV-001</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Licence Number</p>
            <p className="text-lg font-semibold text-foreground">MU/2024/AB123</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Compliance Status</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
              COMPLIANT
            </span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trust Level</p>
            <p className="text-lg font-semibold text-foreground">High (85%)</p>
          </div>
        </div>
      </div>

      {/* AI Behaviour Risk Panel */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          AI Behaviour Risk Assessment
        </h2>
        <div className="flex justify-center">
          <RiskGauge value={15} label="Suspension Risk (6 months)" />
        </div>
      </div>

      {/* Behaviour Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Stability Index"
          value="92%"
          icon={Shield}
          trend="+5% from last month"
          trendUp={true}
        />
        <AnalyticsCard
          title="Days Since Last Offence"
          value="145"
          icon={Calendar}
          trend="Improving"
          trendUp={true}
        />
        <AnalyticsCard
          title="Behaviour Trend"
          value="Positive"
          icon={TrendingUp}
          trend="Low risk trajectory"
          trendUp={true}
        />
      </div>

      {/* Behaviour Trend Chart */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Behaviour Risk Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={behaviourTrendData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="month" 
              className="text-muted-foreground"
              stroke="currentColor"
            />
            <YAxis 
              className="text-muted-foreground"
              stroke="currentColor"
            />
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
              stroke="#4F46E5"
              strokeWidth={3}
              dot={{ fill: "#4F46E5", r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}