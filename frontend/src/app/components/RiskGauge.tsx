interface RiskGaugeProps {
  value: number; // 0-100
  label: string;
}

export function RiskGauge({ value, label }: RiskGaugeProps) {
  const getColor = (val: number) => {
    if (val < 30) return "text-green-600 dark:text-green-400";
    if (val < 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStrokeColor = (val: number) => {
    if (val < 30) return "#16a34a";
    if (val < 70) return "#ca8a04";
    return "#dc2626";
  };

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={getStrokeColor(value)}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${getColor(value)}`}>{value}%</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-4 text-center">{label}</p>
    </div>
  );
}