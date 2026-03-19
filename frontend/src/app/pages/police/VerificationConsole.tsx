import { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Keyboard,
  CheckCircle2,
  XCircle,
  X
} from "lucide-react";

import { BrowserQRCodeReader } from "@zxing/browser";

type VerificationStatus = "idle" | "valid" | "tampered";

export function VerificationConsole() {

  const [verificationMethod, setVerificationMethod] = useState<"qr" | "manual">("qr");
  const [passportToken, setPassportToken] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle");
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<any>(null);

  /* Verify passport with backend */

  const handleVerify = async (token?: string) => {

    try {

      const response = await fetch("http://localhost:8000/verify-passport", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: token ? token : passportToken
      });

      const data = await response.json();

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

      {/* Verification Result */}

      {verificationStatus === "valid" && (

        <div className="flex justify-center">

          <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-green-100">

            <CheckCircle2 className="w-12 h-12 text-green-600"/>

            <div>

              <p className="text-2xl font-bold text-green-800">
                VALID
              </p>

              <p className="text-sm text-green-700">
                Passport verified successfully
              </p>

            </div>

          </div>

        </div>

      )}

      {verificationStatus === "tampered" && (

        <div className="flex justify-center">

          <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-red-100">

            <XCircle className="w-12 h-12 text-red-600"/>

            <div>

              <p className="text-2xl font-bold text-red-800">
                INVALID
              </p>

              <p className="text-sm text-red-700">
                Passport signature mismatch
              </p>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}