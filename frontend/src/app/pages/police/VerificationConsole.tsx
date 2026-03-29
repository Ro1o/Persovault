import { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Keyboard,
  CheckCircle2,
  XCircle,
  X,
  Shield,
  User,
  AlertTriangle,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

import { BrowserQRCodeReader } from "@zxing/browser";
import API_BASE_URL from "../../../config/api";

type VerificationStatus = "idle" | "valid" | "tampered";

// ── NEW: passport data interface for card display ─────────────
interface PassportData {
  driver_id: string;
  compliance:     { status: string; suspension_proximity: number };
  behaviour:      { stability_index: number; trend: string };
  risk:           { classification: { risk_score: number; risk_level: string } };
  trust:          { trust_level: string; verification_mode: string };
  ai_prediction:  { suspension_probability_6m: number; risk_level: string };
  metadata:       { issued_at: string; expires_at: string };
  signature:      string;
}

export function VerificationConsole() {

  const [verificationMethod, setVerificationMethod] = useState<"qr" | "manual">("qr");
  const [passportToken, setPassportToken] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // ── NEW: state for passport card display ─────────────────────
  const [passportData, setPassportData] = useState<PassportData | null>(null);
  const [verificationReason, setVerificationReason] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<any>(null);

  /* Verify passport with backend */

  const handleVerify = async (token?: string) => {

    try {

      // ── CHANGE: parse JSON properly + store passport data ────
      const raw = token ? token : passportToken;
      let body: string;
      try {
        const parsed = JSON.parse(raw);
        body = JSON.stringify(parsed);
      } catch {
        body = raw;
      }

      const response = await apiFetch(`${API_BASE_URL}/verify-passport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: body
      });

      const data = await response.json();

      // Store passport data and reason for card display
      setVerificationReason(data.reason || "");
      setPassportData(data.passport || null);

      if (data.verification_result === "VALID") {
        setVerificationStatus("valid");
      } else {
        setVerificationStatus("tampered");
      }

    } catch (error) {

      console.error("Verification failed:", error);
      setVerificationStatus("tampered");

    }

  };

  /* Start QR scan */

  const handleScan = () => {
    setVerificationStatus("idle");
    setPassportData(null);  // ── NEW: reset passport data on new scan
    setScanError(null);
    setIsScanning(true);
  };

  /* Close scanner */

  const closeScanModal = () => {

    console.log("Closing scanner");

    setIsScanning(false);
    setScanError(null);
    setVerificationStatus("idle");

    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {

      const stream = videoRef.current.srcObject as MediaStream;

      stream.getTracks().forEach(track => track.stop());

      videoRef.current.srcObject = null;

    }

  };

  /* QR Scanner */

  useEffect(() => {

    if (!isScanning) return;

    const codeReader = new BrowserQRCodeReader();
    codeReaderRef.current = codeReader;

    const startScanner = async () => {

      try {

        if (!videoRef.current) return;

        controlsRef.current = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, error) => {

            if (result) {

              const text = result.getText();

              setPassportToken(text);
              setIsScanning(false);

              if (controlsRef.current) {
                controlsRef.current.stop();
                controlsRef.current = null;
              }

              handleVerify(text);

            }

            if (error) {

              if (error.name.includes("NotFound")) return;

              console.error("Scanner error:", error);
              setScanError("Camera scanning error");

            }

          }
        );

      } catch (err) {

        console.error("Camera error:", err);
        setScanError("Unable to start camera");

      }

    };

    startScanner();

    return () => {

      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }

    };

  }, [isScanning]);

  // ── NEW: helper functions for card display ────────────────────
  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "LOW":    return "text-green-600 dark:text-green-400";
      case "MEDIUM": return "text-orange-600 dark:text-orange-400";
      case "HIGH":   return "text-red-600 dark:text-red-400";
      default:       return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend?.toUpperCase()) {
      case "WORSENING": return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "IMPROVING": return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:          return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  return (

    <div className="space-y-6">

      {/* Header */}

      <div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Passport Verification Console
        </h1>

        <p className="text-gray-600 dark:text-gray-400">
          Verify driver digital behaviour passports
        </p>

      </div>

      {/* Verification Method */}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">

        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Verification Method
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <button
            onClick={() => {
              setVerificationMethod("qr");
              setVerificationStatus("idle");
              setPassportToken("");
              setPassportData(null);
            }}
            className={`p-6 rounded-lg border-2 transition-colors ${
              verificationMethod === "qr"
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
            }`}
          >

            <QrCode className="w-8 h-8 mx-auto mb-3 text-gray-600" />

            <p className="text-sm font-medium text-gray-900 dark:text-white">
              QR Code Scanner
            </p>

          </button>

          <button
            onClick={() => {
              setVerificationMethod("manual");
              setVerificationStatus("idle");
              setPassportToken("");
              setPassportData(null);
            }}
            className={`p-6 rounded-lg border-2 transition-colors ${
              verificationMethod === "manual"
                ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
            }`}
          >

            <Keyboard className="w-8 h-8 mx-auto mb-3 text-gray-600" />

            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Manual Token Input
            </p>

          </button>

        </div>

      </div>

      {/* Verification Input */}

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">

        {verificationMethod === "qr" ? (

          <div className="text-center py-12">

            <div className="w-64 h-64 mx-auto mb-6 border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
              <QrCode className="w-32 h-32 text-gray-400" />
            </div>

            <button
              onClick={handleScan}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg"
            >
              Start QR Scan
            </button>

            {scanError && (
              <p className="text-red-500 mt-4">{scanError}</p>
            )}

          </div>

        ) : (

          <div>

            <input
              type="text"
              value={passportToken}
              onChange={(e) => setPassportToken(e.target.value)}
              placeholder="Enter passport token..."
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />

            <button
              onClick={() => handleVerify()}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg"
            >
              Verify Passport
            </button>

          </div>

        )}

      </div>

      {/* Scanner Modal */}

      {isScanning && (

        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">

          <div className="relative w-full max-w-2xl">

            <button
              onClick={closeScanModal}
              className="absolute top-4 right-4 z-50 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-black"/>
            </button>

            <div className="bg-black aspect-square">

              <video
                ref={videoRef}
                className="w-full h-full object-cover pointer-events-none"
              />

            </div>

          </div>

        </div>

      )}

      {/* ── CHANGED: Verification Result — now shows full passport card ── */}

      {verificationStatus !== "idle" && (

        <div className={`rounded-2xl overflow-hidden shadow-2xl border-2 ${
          verificationStatus === "valid" ? "border-green-500" : "border-red-500"
        }`}>

          {/* Card Header */}
          <div className={`px-6 py-4 flex items-center justify-between ${
            verificationStatus === "valid" ? "bg-green-500" : "bg-red-500"
          }`}>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">
                PersoVault — Behaviour Passport
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              {verificationStatus === "valid"
                ? <CheckCircle2 className="w-5 h-5 text-white" />
                : <XCircle className="w-5 h-5 text-white" />
              }
              <span className="text-white font-bold">
                {verificationStatus === "valid" ? "VERIFIED" : "INVALID"}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="bg-white dark:bg-gray-800 p-6">

            {verificationStatus === "valid" && passportData ? (

              <div className="space-y-6">

                {/* Driver Info */}
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Driver ID</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                      {passportData.driver_id}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Compliance</p>
                    <p className={`text-lg font-bold ${
                      passportData.compliance.status === "VALID" ? "text-green-600" : "text-red-600"
                    }`}>
                      {passportData.compliance.status}
                    </p>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk Level</p>
                    <p className={`text-lg font-bold ${getRiskColor(passportData.risk.classification.risk_level)}`}>
                      {passportData.risk.classification.risk_level}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trust Level</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {passportData.trust.trust_level}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stability</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {passportData.behaviour.stability_index}%
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Susp. Risk</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {Math.round(passportData.compliance.suspension_proximity * 100)}%
                    </p>
                  </div>
                </div>

                {/* AI Prediction */}
                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      AI Suspension Probability (6 months)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Based on machine learning analysis
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(passportData.behaviour.trend)}
                    <span className={`text-lg font-bold ${
                      passportData.ai_prediction.suspension_probability_6m > 0.5
                        ? "text-red-600" : "text-green-600"
                    }`}>
                      {Math.round(passportData.ai_prediction.suspension_probability_6m * 100)}%
                    </span>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>Issued: {formatDate(passportData.metadata.issued_at)}</span>
                  <span className="mx-2">•</span>
                  <span>Expires: {formatDate(passportData.metadata.expires_at)}</span>
                </div>

                {/* Signature */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    HMAC-SHA256 Cryptographic Signature
                  </p>
                  <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                    {passportData.signature}
                  </p>
                </div>

              </div>

            ) : verificationStatus === "tampered" ? (

              <div className="flex flex-col items-center py-8 gap-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">
                    Passport Invalid
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {verificationReason || "Cryptographic signature mismatch — this passport has been tampered with or has expired."}
                  </p>
                </div>
              </div>

            ) : null}

          </div>

          {/* Card Footer */}
          <div className={`px-6 py-3 text-xs text-white flex items-center justify-between ${
            verificationStatus === "valid" ? "bg-green-600" : "bg-red-600"
          }`}>
            <span>PersoVault Digital Identity System • Republic of Mauritius</span>
            <span>{new Date().toLocaleString()}</span>
          </div>

        </div>

      )}

    </div>

  );

}