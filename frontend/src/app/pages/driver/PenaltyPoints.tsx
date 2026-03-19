import { AlertTriangle, Calendar, MapPin, FileText, Clock, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PenaltyPoint {
  id: string;
  offenseType: string;
  description: string;
  location: string;
  dateAcquired: string;
  dateExpires: string;
  points: number;
  status: "active" | "expired";
  fine: string;
}

const mockPenaltyPoints: PenaltyPoint[] = [
  {
    id: "PP-001",
    offenseType: "Speeding",
    description: "Exceeding speed limit by 25 km/h in residential area",
    location: "Royal Road, Port Louis",
    dateAcquired: "2023-08-15",
    dateExpires: "2026-08-15",
    points: 4,
    status: "active",
    fine: "Rs 3,000",
  },
  {
    id: "PP-002",
    offenseType: "Mobile Phone Use",
    description: "Using mobile phone while driving without hands-free device",
    location: "Motorway M1, Curepipe",
    dateAcquired: "2024-01-20",
    dateExpires: "2027-01-20",
    points: 3,
    status: "active",
    fine: "Rs 1,500",
  },
  {
    id: "PP-003",
    offenseType: "Failure to Observe Traffic Signs",
    description: "Failed to stop at mandatory stop sign",
    location: "Avenue de la Paix, Quatre Bornes",
    dateAcquired: "2024-02-10",
    dateExpires: "2027-02-10",
    points: 1,
    status: "active",
    fine: "Rs 500",
  },
  {
    id: "PP-004",
    offenseType: "Red Light Violation",
    description: "Failed to stop at red traffic signal",
    location: "Junction Desroches, Quatre Bornes",
    dateAcquired: "2021-05-03",
    dateExpires: "2024-05-03",
    points: 4,
    status: "expired",
    fine: "Rs 3,000",
  },
  {
    id: "PP-005",
    offenseType: "No Seatbelt",
    description: "Driver not wearing seatbelt",
    location: "Coastal Road, Flic en Flac",
    dateAcquired: "2020-11-18",
    dateExpires: "2023-11-18",
    points: 2,
    status: "expired",
    fine: "Rs 1,000",
  },
];

export function PenaltyPoints() {
  const activePoints = mockPenaltyPoints.filter(p => p.status === "active");
  const expiredPoints = mockPenaltyPoints.filter(p => p.status === "expired");
  const currentTotal = activePoints.reduce((sum, p) => sum + p.points, 0);
  const maxPoints = 12;

  const getStatusColor = (status: string) => {
    return status === "active" 
      ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400" 
      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  };

  const getPointsColor = (points: number) => {
    if (points <= 2) return "text-yellow-600 dark:text-yellow-400";
    if (points <= 3) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const progressPercentage = (currentTotal / maxPoints) * 100;
  const getProgressColor = () => {
    if (progressPercentage <= 50) return "bg-green-500";
    if (progressPercentage <= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Penalty Points History
          </h1>
          <p className="text-muted-foreground">
            View all your penalty points, violations, and expiry dates
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current Total Points</p>
            <p className="text-4xl font-bold text-foreground">{currentTotal}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Maximum Allowed</p>
            <p className="text-4xl font-bold text-foreground">{maxPoints}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Active Violations</p>
            <p className="text-4xl font-bold text-foreground">{activePoints.length}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">Points Used</span>
            <span className="text-sm text-muted-foreground">
              {currentTotal} / {maxPoints} points ({progressPercentage.toFixed(0)}%)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`${getProgressColor()} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          {progressPercentage > 75 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Warning: You are approaching the maximum penalty points limit
            </p>
          )}
        </div>
      </div>

      {/* Active Penalty Points */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Active Penalty Points
        </h2>
        
        {activePoints.length === 0 ? (
          <div className="bg-card rounded-lg p-8 border border-border shadow-sm text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-foreground mb-2">No Active Penalty Points</p>
            <p className="text-muted-foreground">You have a clean driving record. Keep up the safe driving!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activePoints.map((point) => (
              <div
                key={point.id}
                className="bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {point.offenseType}
                        </h3>
                        <p className="text-sm text-muted-foreground">{point.description}</p>
                      </div>
                      <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(point.status)}`}>
                        {point.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium text-foreground">{point.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fine Amount</p>
                          <p className="text-sm font-medium text-foreground">{point.fine}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date Acquired</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(point.dateAcquired).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Expires On</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(point.dateExpires).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Points Badge */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-2">
                    <div className="text-center bg-muted rounded-lg p-4 min-w-[100px]">
                      <p className="text-xs text-muted-foreground mb-1">Penalty Points</p>
                      <p className={`text-3xl font-bold ${getPointsColor(point.points)}`}>
                        {point.points}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expired Penalty Points */}
      {expiredPoints.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Expired Penalty Points
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {expiredPoints.map((point) => (
              <div
                key={point.id}
                className="bg-card rounded-lg p-6 border border-border shadow-sm opacity-60"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {point.offenseType}
                        </h3>
                        <p className="text-sm text-muted-foreground">{point.description}</p>
                      </div>
                      <span className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(point.status)}`}>
                        {point.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium text-foreground">{point.location}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Fine Amount</p>
                          <p className="text-sm font-medium text-foreground">{point.fine}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date Acquired</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(point.dateAcquired).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Expired On</p>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(point.dateExpires).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Points Badge */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-2">
                    <div className="text-center bg-muted rounded-lg p-4 min-w-[100px]">
                      <p className="text-xs text-muted-foreground mb-1">Penalty Points</p>
                      <p className="text-3xl font-bold text-gray-400">
                        {point.points}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
          About Penalty Points
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Penalty points remain on your licence for 3 years from the date of the offense</li>
          <li>• The maximum allowed is 12 points - exceeding this may result in licence suspension</li>
          <li>• Points automatically expire after 3 years if no new violations occur</li>
          <li>• Some serious offenses may result in immediate suspension regardless of points</li>
        </ul>
      </div>
    </div>
  );
}