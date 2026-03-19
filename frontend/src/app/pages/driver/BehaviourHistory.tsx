import { Shield, TrendingDown, Calendar, AlertTriangle, CheckCircle, XCircle, Phone, Navigation } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const behaviourTrendData = [
  { month: "Sep", risk: 25 },
  { month: "Oct", risk: 23 },
  { month: "Nov", risk: 21 },
  { month: "Dec", risk: 20 },
  { month: "Jan", risk: 18 },
  { month: "Feb", risk: 16 },
  { month: "Mar", risk: 15 },
];

const timelineEvents = [
  {
    id: 1,
    date: "10 Feb 2024",
    title: "Traffic Violation",
    description: "Failure to stop at mandatory stop sign",
    location: "Quatre Bornes",
    status: "active",
    type: "violation",
  },
  {
    id: 2,
    date: "20 Jan 2024",
    title: "Mobile Phone Violation",
    description: "Using mobile phone while driving",
    location: "Curepipe",
    status: "active",
    type: "violation",
  },
  {
    id: 3,
    date: "15 Aug 2023",
    title: "Speeding Violation",
    description: "Exceeded speed limit by 25 km/h",
    location: "Port Louis",
    status: "active",
    type: "violation",
  },
  {
    id: 4,
    date: "03 May 2021",
    title: "Red Light Violation (Expired)",
    description: "Ran a red light at intersection",
    location: "Quatre Bornes",
    status: "expired",
    type: "violation",
  },
];

export function BehaviourHistory() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Behaviour History
        </h1>
        <p className="text-muted-foreground">
          Track your driving behaviour and offence history
        </p>
      </div>

      {/* Behaviour Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Stability Index</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">92%</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Excellent</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Penalty Points</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">8 / 12</p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">4 points remaining</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Clean Driving Days</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">145</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Since last offence</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">Suspension Risk</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">15%</p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">Decreasing</p>
        </div>
      </div>

      {/* AI Behaviour Trend Chart */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          AI Behaviour Risk Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={behaviourTrendData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="month" 
              className="text-muted-foreground"
            />
            <YAxis 
              className="text-muted-foreground"
              label={{ value: 'Risk %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="risk" 
              stroke="#22c55e" 
              strokeWidth={2}
              dot={{ fill: '#22c55e', r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Your risk score has decreased by 10% over the last 7 months
        </p>
      </div>

      {/* Behaviour Timeline */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          Offence History Timeline
        </h2>
        <div className="space-y-6">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {index !== timelineEvents.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border"></div>
              )}
              
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.status === "expired" 
                      ? "bg-gray-100 dark:bg-gray-900" 
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}>
                    {event.status === "expired" ? (
                      <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>

                {/* Event content */}
                <div className={`flex-1 pb-6 ${event.status === "expired" ? "opacity-60" : ""}`}>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.date}</p>
                      </div>
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
                    <p className="text-sm text-foreground mb-2">{event.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Navigation className="w-4 h-4" />
                      <span>Location: {event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Positive Period Indicator */}
        <div className="mt-6 bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-900/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-400">Clean Driving Period</h3>
              <p className="text-sm text-green-800 dark:text-green-500 mt-1">
                You've maintained clean driving behaviour for 145 consecutive days. Keep up the excellent work!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}