import { AlertTriangle, Calendar, MapPin, FileText, Clock, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API_BASE_URL, { apiFetch } from "../../../config/api";

interface Offence {
  id:           number;
  title:        string;
  description:  string;
  location:     string;
  severity:     string;
  points:       number;
  status:       string;
  offence_date: string;
}

// Expiry = 3 years after offence date
function getExpiryDate(offenceDate: string): string {
  try {
    const d = new Date(offenceDate);
    d.setFullYear(d.getFullYear() + 3);
    return d.toISOString().split("T")[0];
  } catch {
    return offenceDate;
  }
}

// Fine estimate based on severity
function estimateFine(severity: string): string {
  switch (severity) {
    case "severe":   return "Rs 5,000+";
    case "moderate": return "Rs 3,000";
    case "minor":    return "Rs 1,000";
    default:         return "Rs 500";
  }
}

const getPointsColor = (points: number) => {
  if (points <= 2) return "text-yellow-600 dark:text-yellow-400";
  if (points <= 4) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

const getStatusColor = (status: string) =>
  status === "active"
    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";

export function PenaltyPoints() {
  const navigate = useNavigate();

  const [offences, setOffences] = useState<Offence[]>([]);
  const [loading, setLoading]   = useState(true);

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
  );

  const fetchOffences = async () => {
    setLoading(true);
    try {
      const driverId = user.driver_id;
      if (!driverId) return;

      const res = await apiFetch(`${API_BASE_URL}/offences/${driverId}`);
      if (res.ok) {
        const data = await res.json();
        setOffences(data.offences || []);
      }
    } catch {
      setOffences([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffences(); }, []);

  const activePoints   = offences.filter(o => o.status === "active");
  const expiredPoints  = offences.filter(o => o.status === "expired");
  const currentTotal   = activePoints.reduce((sum, o) => sum + o.points, 0);
  const maxPoints      = 12;
  const isSuspended    = currentTotal >= maxPoints;    // ── single source of truth
  const progressPct    = Math.min((currentTotal / maxPoints) * 100, 100);

  const getProgressColor = () => {
    if (progressPct <= 50) return "bg-green-500";
    if (progressPct <= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const renderOffenceCard = (offence: Offence, isExpired = false) => (
    <div
      key={offence.id}
      className={`bg-card rounded-lg p-6 border border-border shadow-sm hover:shadow-md transition-shadow ${isExpired ? "opacity-60" : ""}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">{offence.title}</h3>
              <p className="text-sm text-muted-foreground">{offence.description}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                offence.severity === "severe"   ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                offence.severity === "moderate" ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" :
                "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              }`}>
                {offence.severity}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(offence.status)}`}>
                {offence.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium text-foreground">{offence.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Fine Amount</p>
                <p className="text-sm font-medium text-foreground">{estimateFine(offence.severity)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Date Acquired</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(offence.offence_date).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">
                  {isExpired ? "Expired On" : "Expires On"}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(getExpiryDate(offence.offence_date)).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric"
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col items-center lg:items-end gap-2">
          <div className="text-center bg-muted rounded-lg p-4 min-w-[100px]">
            <p className="text-xs text-muted-foreground mb-1">Penalty Points</p>
            <p className={`text-3xl font-bold ${isExpired ? "text-gray-400" : getPointsColor(offence.points)}`}>
              {offence.points}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">Penalty Points History</h1>
          <p className="text-muted-foreground">View all your penalty points, violations, and expiry dates</p>
        </div>
        <button
          onClick={fetchOffences}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading penalty points...
        </div>
      )}

      {!loading && (
        <>
          {/* Suspension Banner — shown prominently when suspended */}
          {isSuspended && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800 dark:text-red-400">Licence Suspended</p>
                <p className="text-sm text-red-700 dark:text-red-500">
                  Your licence has been automatically suspended. You have accumulated {currentTotal} penalty points,
                  exceeding the maximum allowed limit of {maxPoints} points.
                </p>
              </div>
            </div>
          )}

          {/* Summary Card */}
          <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Total Points</p>
                {/* ── CHANGE: red when suspended ── */}
                <p className={`text-4xl font-bold ${isSuspended ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                  {currentTotal}
                </p>
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
                {/* ── CHANGE: show SUSPENDED label instead of "34 / 12 (100%)" ── */}
                <span className={`text-sm font-medium ${isSuspended ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                  {isSuspended
                    ? `SUSPENDED — ${currentTotal} pts accumulated (max: ${maxPoints})`
                    : `${currentTotal} / ${maxPoints} points (${progressPct.toFixed(0)}%)`
                  }
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className={`${getProgressColor()} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {/* Only show approach warning if NOT yet suspended */}
              {progressPct > 75 && !isSuspended && (
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
                {activePoints.map(o => renderOffenceCard(o, false))}
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
                {expiredPoints.map(o => renderOffenceCard(o, true))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              About Penalty Points
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Penalty points remain on your licence for 3 years from the date of the offence</li>
              <li>• The maximum allowed is 12 points — exceeding this results in licence suspension</li>
              <li>• Points automatically expire after 3 years if no new violations occur</li>
              <li>• Some serious offences may result in immediate suspension regardless of points</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}