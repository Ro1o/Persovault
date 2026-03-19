import { AnalyticsCard } from "../../components/AnalyticsCard";
import { Users, AlertTriangle, CreditCard, ScanLine } from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const riskDistributionData = [
  { id: "low", name: "Low Risk", value: 450, color: "#16a34a" },
  { id: "medium", name: "Medium Risk", value: 280, color: "#ca8a04" },
  { id: "high", name: "High Risk", value: 120, color: "#dc2626" },
];

const behaviourTrendData = [
  { month: "Sep", avgRisk: 35 },
  { month: "Oct", avgRisk: 32 },
  { month: "Nov", avgRisk: 30 },
  { month: "Dec", avgRisk: 28 },
  { month: "Jan", avgRisk: 25 },
  { month: "Feb", avgRisk: 23 },
  { month: "Mar", avgRisk: 22 },
];

const topRiskFactors = [
  { id: "points", factor: "Current Points", impact: 92 },
  { id: "severe", factor: "Severe Offences", impact: 85 },
  { id: "recent", factor: "Offences Last 12 Months", impact: 78 },
  { id: "suspensions", factor: "Previous Suspensions", impact: 65 },
  { id: "duration", factor: "Licence Duration", impact: 42 },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          System-wide monitoring and analytics
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Drivers"
          value="850"
          icon={Users}
          trend="+12 this week"
          trendUp={true}
        />
        <AnalyticsCard
          title="High Risk Drivers"
          value="120"
          icon={AlertTriangle}
          trend="-8 from last month"
          trendUp={true}
        />
        <AnalyticsCard
          title="Active Passports"
          value="823"
          icon={CreditCard}
          trend="96.8% active"
          trendUp={true}
        />
        <AnalyticsCard
          title="Verification Requests"
          value="1,245"
          icon={ScanLine}
          trend="+23% this month"
          trendUp={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Suspension Risk Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={false}
              >
                {riskDistributionData.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Behaviour Trend */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Average Behaviour Risk Trend
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
                dataKey="avgRisk"
                stroke="#4F46E5"
                strokeWidth={3}
                dot={{ fill: "#4F46E5", r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Risk Factors */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Top Risk Factors (Explainable AI)
        </h2>
        <div className="space-y-4">
          {topRiskFactors.map((factor) => (
            <div key={factor.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">
                  {factor.factor}
                </span>
                <span className="text-sm text-muted-foreground">
                  {factor.impact}% impact
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${factor.impact}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}