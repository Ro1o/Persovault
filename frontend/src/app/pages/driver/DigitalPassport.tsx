import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield, Calendar, AlertTriangle, TrendingUp } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function DigitalPassport() {
  const navigate = useNavigate();
  
  const passportData = {
    driverId: "DRV-001",
    riskLevel: "Low",
    trustLevel: "85%",
    complianceStatus: "COMPLIANT",
    stabilityIndex: "92%",
    suspensionProximity: "15%",
    issued: "2024-01-15 10:30:00",
    expiry: "2026-01-15 10:30:00",
    status: "VALID",
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
            Digital Behaviour Passport
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered compliance credential
          </p>
        </div>
      </div>

      {/* Digital Behaviour Passport Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-100 dark:to-gray-50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm px-8 py-4 border-b border-white/20 dark:border-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-white dark:text-gray-900" />
                <span className="text-white dark:text-gray-900 font-semibold">Digital Behaviour Passport</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                passportData.status === "VALID" ? "bg-green-500" :
                passportData.status === "EXPIRED" ? "bg-yellow-500" :
                "bg-red-500"
              }`}>
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{passportData.status}</span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left & Center Columns - Passport Info */}
              <div className="md:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Driver ID</p>
                    <p className="text-white dark:text-gray-900 font-semibold">{passportData.driverId}</p>
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

              {/* Right Column - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG
                    value="PERSOVAULT:PASSPORT:DRV-001:VALID"
                    size={160}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="text-gray-200 dark:text-gray-700 text-xs mt-3 text-center">
                  Scan to verify
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Integrity Status */}
        <div className="mt-6 flex justify-center">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg ${
            passportData.status === "VALID" ? "bg-green-100 dark:bg-green-900/30" :
            passportData.status === "EXPIRED" ? "bg-yellow-100 dark:bg-yellow-900/30" :
            "bg-red-100 dark:bg-red-900/30"
          }`}>
            {passportData.status === "VALID" ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-800 dark:text-green-400">
                  Integrity Status: VALID
                </span>
              </>
            ) : passportData.status === "EXPIRED" ? (
              <>
                <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-semibold text-yellow-800 dark:text-yellow-400">
                  Integrity Status: EXPIRED
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span className="font-semibold text-red-800 dark:text-red-400">
                  Integrity Status: TAMPERED
                </span>
              </>
            )}
          </div>
        </div>

        {/* AI Explanation Panel */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            AI Risk Explanation - Top Risk Factors
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Current Points: 0
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No penalty points on record - strong positive indicator
                </p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Severe Offences: 0
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No severe violations detected in the last 3 years
                </p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 font-bold">3</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Offences Last 12 Months: 1 minor
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  One minor speeding offence, well within acceptable limits
                </p>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}