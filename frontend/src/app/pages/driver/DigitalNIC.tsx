import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield, XCircle, AlertCircle, Lock, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import API_BASE_URL from "../../../config/api";

const coatOfArms = "/coat-of-arms.png";

interface SecurityLayer {
  valid: boolean;
  reason: string;
  risk?: number;
}

interface NICSecurityReport {
  nic_number: string;
  full_name: string;
  fraud_score: number;
  fraud_level: "VERIFIED" | "SUSPICIOUS" | "FRAUDULENT";
  fraud_summary: string;
  registered_at: string;
  security_layers: {
    format:    SecurityLayer;
    dob:       SecurityLayer;
    letter:    SecurityLayer;
    honeypot:  SecurityLayer;
    signature: SecurityLayer;
    travel:    SecurityLayer;
    duplicate: SecurityLayer;
  };
}

export function DigitalNIC() {
  const navigate = useNavigate();
  const [securityReport, setSecurityReport] = useState<NICSecurityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
  );

  const fetchSecurityReport = async () => {
    if (!user?.username) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-nic/${user.username}`);
      if (response.ok) {
        const data = await response.json();
        setSecurityReport(data);
      } else if (response.status === 404) {
        setError("No NIC registered for this account");
      } else {
        setError("Failed to load NIC security report");
      }
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityReport();
  }, []);

  const getFraudColor = (level: string) => {
    switch (level) {
      case "VERIFIED":   return "bg-green-500";
      case "SUSPICIOUS": return "bg-orange-500";
      case "FRAUDULENT": return "bg-red-500";
      default:           return "bg-gray-500";
    }
  };

  // Score is security score (100 - fraud_score), higher = better
  const getSecurityScore = (fraudScore: number) => 100 - fraudScore;

  const getScoreColor = (fraudScore: number) => {
    if (fraudScore <= 25) return "text-green-600 dark:text-green-400";
    if (fraudScore <= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBarColor = (fraudScore: number) => {
    if (fraudScore <= 25) return "bg-green-500";
    if (fraudScore <= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const layerLabels: Record<string, string> = {
    format:    "Format Validation",
    dob:       "Date of Birth Consistency",
    letter:    "Letter Match Check",
    honeypot:  "Blocklist Check",
    signature: "CA Digital Signature",
    travel:    "Impossible Travel",
    duplicate: "Duplicate Check",
  };

  const layerDescriptions: Record<string, string> = {
    format:    "Letter + DDMMYY + 6 digits + Letter (14 chars, first = last letter)",
    dob:       "First 6 digits of NIC must match declared date of birth",
    letter:    "First and last letter of NIC must be identical",
    honeypot:  "NIC checked against pre-registered fraud trap numbers",
    signature: "HMAC-SHA256 cryptographic tamper detection",
    travel:    "Impossible simultaneous location detection",
    duplicate: "NIC must be unique across entire system",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/driver/wallet")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Digital National Identity Card
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Republic of Mauritius</p>
        </div>
      </div>

      {/* Digital NIC Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-100 dark:to-gray-50 rounded-2xl shadow-2xl overflow-hidden">

          {/* Card Header */}
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm px-8 py-4 border-b border-white/20 dark:border-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-white dark:text-gray-900" />
                <span className="text-white dark:text-gray-900 font-semibold">Republic of Mauritius</span>
              </div>
              {securityReport && (
                <div className={`flex items-center gap-2 ${getFraudColor(securityReport.fraud_level)} px-3 py-1 rounded-full`}>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">{securityReport.fraud_level}</span>
                </div>
              )}
              {!securityReport && !loading && (
                <div className="flex items-center gap-2 bg-gray-500 px-3 py-1 rounded-full">
                  <span className="text-white text-sm font-medium">UNVERIFIED</span>
                </div>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            <div className="flex items-start gap-8">
              {/* Left Column */}
              <div className="flex-shrink-0 space-y-6">
                <div className="w-24 h-24 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm p-2">
                  <img src={coatOfArms} alt="Mauritius Coat of Arms" className="w-full h-full object-contain" />
                </div>
                <div className="w-32 h-40 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white/70 dark:text-gray-900/70 text-sm">Photo</div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-white dark:text-gray-900 text-xl font-bold mb-1">National Identity Card</h2>
                  <p className="text-gray-300 dark:text-gray-600 text-sm">Carte d'Identité Nationale</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Full Name</p>
                    <p className="text-white dark:text-gray-900 text-xl font-bold">
                      {securityReport?.full_name || "John Michael Smith"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">NIC Number</p>
                    <p className="text-white dark:text-gray-900 font-semibold">
                      {securityReport?.nic_number || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Nationality</p>
                    <p className="text-white dark:text-gray-900 font-semibold">Mauritian</p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Registered</p>
                    <p className="text-white dark:text-gray-900 font-semibold text-sm">
                      {securityReport?.registered_at
                        ? new Date(securityReport.registered_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Security Score</p>
                    <p className={`font-bold text-lg ${
                      securityReport
                        ? securityReport.fraud_score <= 25 ? "text-green-400"
                        : securityReport.fraud_score <= 50 ? "text-orange-400"
                        : "text-red-400"
                        : "text-gray-400"
                    }`}>
                      {securityReport ? `${getSecurityScore(securityReport.fraud_score)}/100` : "—"}
                    </p>
                  </div>
                </div>

                {/* CA Signature indicator */}
                <div className="pt-4 border-t border-white/20 dark:border-black/20">
                  <p className="text-gray-300 dark:text-gray-600 text-xs mb-2">CA Digital Signature</p>
                  <div className="h-12 bg-white/10 dark:bg-black/10 rounded-lg flex items-center px-4 gap-2">
                    <Lock className="w-4 h-4 text-green-400" />
                    <span className="text-white/70 dark:text-gray-900/70 italic text-sm font-mono">
                      {securityReport?.security_layers?.signature?.valid
                        ? "✓ HMAC-SHA256 Verified"
                        : "Pending verification..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mauritius Flag Footer */}
          <div className="h-3 grid grid-cols-4">
            <div className="bg-red-600"></div>
            <div className="bg-blue-600"></div>
            <div className="bg-yellow-400"></div>
            <div className="bg-green-600"></div>
          </div>
        </div>

        {/* Security Report Panel */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                7-Layer Security Report
              </h2>
            </div>
            <button
              onClick={fetchSecurityReport}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {loading && (
            <div className="p-8 text-center text-gray-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Running security checks...
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </div>
          )}

          {securityReport && !loading && (
            <div className="p-6 space-y-6">

              {/* Security Score */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Security Score
                  </span>
                  <span className={`text-2xl font-bold ${getScoreColor(securityReport.fraud_score)}`}>
                    {getSecurityScore(securityReport.fraud_score)}/100
                  </span>
                </div>
                {/* Bar fills from left — higher security = more green bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${getScoreBarColor(securityReport.fraud_score)}`}
                    style={{ width: `${getSecurityScore(securityReport.fraud_score)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 — Fraudulent</span>
                  <span>50 — Suspicious</span>
                  <span>100 — Verified</span>
                </div>
              </div>

              {/* Security Layers */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Security Layer Results
                </h3>
                <div className="space-y-3">
                  {Object.entries(securityReport.security_layers).map(([key, layer]) => (
                    <div
                      key={key}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        layer.valid
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      }`}
                    >
                      {layer.valid
                        ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        : <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      }
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {layerLabels[key] || key}
                          </p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            layer.valid
                              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                          }`}>
                            {layer.valid ? "PASS" : "FAIL"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {layerDescriptions[key]}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                          {layer.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className={`p-4 rounded-lg border ${
                securityReport.fraud_level === "VERIFIED"
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : securityReport.fraud_level === "SUSPICIOUS"
                  ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Verification Summary</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{securityReport.fraud_summary}</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}