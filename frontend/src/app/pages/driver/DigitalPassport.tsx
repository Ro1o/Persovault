import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield, Calendar, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import API_BASE_URL, { apiFetch } from "../../../config/api";

interface LivePassport {
  driver_id: string;
  compliance:     { status: string; suspension_proximity: number };
  behaviour:      { stability_index: number; trend: string };
  risk:           { classification: { risk_score: number; risk_level: string } };
  trust:          { trust_level: string };
  ai_prediction:  { suspension_probability_6m: number };
  ai_explanation: { top_risk_factors: any[] };
  metadata:       { issued_at: string; expires_at: string };
  signature:      string;
}

export function DigitalPassport() {
  const navigate = useNavigate();

  const [livePassport, setLivePassport] = useState<LivePassport | null>(null);
  const [passportJson, setPassportJson] = useState("PERSOVAULT:LOADING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
  );

  const generatePassport = async () => {
    setLoading(true);
    setError(null);
    try {
      const driverId = user.driver_id;
      if (!driverId) throw new Error("No driver ID");

      // Step 1 — fetch real stats and offences in parallel
      const [statsRes, offencesRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/driver-stats/${driverId}`),
        apiFetch(`${API_BASE_URL}/offences/${driverId}`),
      ]);

      const stats   = statsRes.ok    ? await statsRes.json()    : {};
      const offData = offencesRes.ok ? await offencesRes.json() : { offences: [] };
      const offences = offData.offences || [];

      const totalPoints = stats.total_points ?? 0;
      const cleanDays   = stats.clean_days   ?? 0;

      const minor    = offences.filter((o: any) => o.severity === "minor").length;
      const moderate = offences.filter((o: any) => o.severity === "moderate").length;
      const severe   = offences.filter((o: any) => o.severity === "severe").length;

      let avgDays = 300;
      if (offences.length >= 2) {
        const sorted = [...offences].sort((a: any, b: any) =>
          new Date(a.offence_date).getTime() - new Date(b.offence_date).getTime()
        );
        let totalGap = 0;
        for (let i = 1; i < sorted.length; i++) {
          const diff = new Date(sorted[i].offence_date).getTime() - new Date(sorted[i-1].offence_date).getTime();
          totalGap += diff / (1000 * 60 * 60 * 24);
        }
        avgDays = Math.round(totalGap / (sorted.length - 1));
      }

      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);
      const offencesLast12m = offences.filter((o: any) =>
        new Date(o.offence_date) >= twelveMonthsAgo
      ).length;

      // Step 2 — call validate-driver with real data
      const response = await apiFetch(
        `${API_BASE_URL}/validate-driver?verification_mode=ONLINE`,
        {
          method: "POST",
          body: JSON.stringify({
            driver_id:                 driverId,
            current_points:            totalPoints,
            previous_points:           Math.max(totalPoints - 2, 0),
            offences_last_12m:         offencesLast12m,
            minor_offences:            minor,
            moderate_offences:         moderate,
            severe_offences:           severe,
            days_since_last_offence:   cleanDays,
            avg_days_between_offences: avgDays,
            years_since_licence_issue: 3,
            last_sync: new Date().toISOString().split("T")[0],
          }),
        }
      );
      if (!response.ok) throw new Error("Failed");
      const data: LivePassport = await response.json();
      setLivePassport(data);
      setPassportJson(JSON.stringify(data));
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { generatePassport(); }, []);

  const isExpired = livePassport ? new Date() > new Date(livePassport.metadata.expires_at) : false;

  const passportData = livePassport ? {
    driverId:            livePassport.driver_id,
    riskLevel:           livePassport.risk.classification.risk_level,
    trustLevel:          livePassport.trust.trust_level,
    complianceStatus:    livePassport.compliance.status,
    stabilityIndex:      `${livePassport.behaviour.stability_index}%`,
    suspensionProximity: `${Math.round(livePassport.compliance.suspension_proximity * 100)}%`,
    issued:              new Date(livePassport.metadata.issued_at).toLocaleString(),
    expiry:              new Date(livePassport.metadata.expires_at).toLocaleString(),
    status:              isExpired ? "EXPIRED" : livePassport.compliance.status,
  } : {
    driverId: "—", riskLevel: "—", trustLevel: "—",
    complianceStatus: "—", stabilityIndex: "—", suspensionProximity: "—",
    issued: "—", expiry: "—", status: "VALID",
  };

  const getFactorLabel = (factor: any): string => {
    if (typeof factor === "string") return factor.replace(/_/g, " ");
    if (factor?.feature) return `${factor.feature.replace(/_/g, " ")}: ${factor.value ?? ""}`;
    return String(factor);
  };

  const getFactorDescription = (factor: any): string => {
    if (typeof factor === "string") return "This factor significantly influences your AI risk assessment";
    if (factor?.impact) return factor.impact;
    return "This factor significantly influences your AI risk assessment";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/app/driver/wallet")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Digital Behaviour Passport</h1>
          <p className="text-gray-600 dark:text-gray-400">AI-powered compliance credential</p>
        </div>
        <button onClick={generatePassport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-500">Generating passport...</span>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-100 dark:to-gray-50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm px-8 py-4 border-b border-white/20 dark:border-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-white dark:text-gray-900" />
                <span className="text-white dark:text-gray-900 font-semibold">Digital Behaviour Passport</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                passportData.status === "VALID" ? "bg-green-500" :
                passportData.status === "EXPIRED" ? "bg-yellow-500" : "bg-red-500"
              }`}>
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{passportData.status}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Driver ID</p>
                    <p className="text-white dark:text-gray-900 font-semibold font-mono">{passportData.driverId}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Risk Level</p>
                    <p className="text-white dark:text-gray-900 font-semibold">{passportData.riskLevel}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Trust Level</p>
                    <p className="text-white dark:text-gray-900 font-semibold">{passportData.trustLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Compliance Status</p>
                    <p className="text-white dark:text-gray-900 font-semibold">{passportData.complianceStatus}</p>
                  </div>
                </div>
                <div className="border-t border-white/20 dark:border-black/20 pt-6">
                  <p className="text-gray-300 dark:text-gray-600 text-sm mb-4">Behaviour Indicators</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Stability Index</p>
                      <p className="text-white dark:text-gray-900 font-semibold">{passportData.stabilityIndex}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Suspension Proximity</p>
                      <p className="text-white dark:text-gray-900 font-semibold">{passportData.suspensionProximity}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/20 dark:border-black/20 pt-6">
                  <p className="text-gray-300 dark:text-gray-600 text-sm mb-2">Metadata</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-300 dark:text-gray-600 text-xs">Issued Timestamp</p>
                      <p className="text-white dark:text-gray-900 text-sm">{passportData.issued}</p>
                    </div>
                    <div>
                      <p className="text-gray-300 dark:text-gray-600 text-xs">Expiry Timestamp</p>
                      <p className="text-white dark:text-gray-900 text-sm">{passportData.expiry}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG value={passportJson} size={160} level="L" includeMargin={false} />
                </div>
                <p className="text-gray-200 dark:text-gray-700 text-xs mt-3 text-center">Scan to verify</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${
            passportData.status === "VALID" ? "bg-green-100 dark:bg-green-900/30" :
            passportData.status === "EXPIRED" ? "bg-yellow-100 dark:bg-yellow-900/30" :
            "bg-red-100 dark:bg-red-900/30"
          }`}>
            {passportData.status === "VALID" ? (
              <><CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="font-semibold text-green-800 dark:text-green-400">Integrity Status: VALID</span></>
            ) : passportData.status === "EXPIRED" ? (
              <><Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="font-semibold text-yellow-800 dark:text-yellow-400">Integrity Status: EXPIRED</span></>
            ) : (
              <><AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="font-semibold text-red-800 dark:text-red-400">Integrity Status: TAMPERED</span></>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            AI Risk Explanation - Top Risk Factors
          </h2>
          <div className="space-y-4">
            {(livePassport?.ai_explanation?.top_risk_factors || []).slice(0, 3).map((factor, index) => (
              <div key={index}
                className={`flex items-start gap-3 ${index < 2 ? "pb-4 border-b border-gray-200 dark:border-gray-700" : ""}`}>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1 capitalize">
                    {getFactorLabel(factor)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{getFactorDescription(factor)}</p>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${
                        passportData.riskLevel === "HIGH"   ? "bg-red-500" :
                        passportData.riskLevel === "MEDIUM" ? "bg-yellow-500" : "bg-green-600"
                      }`}
                      style={{ width: `${Math.max(15, 100 - index * 25)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
}