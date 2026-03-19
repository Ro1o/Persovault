import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield, Calendar, User, CreditCard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export function DigitalLicence() {
  const navigate = useNavigate();

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
            Digital Driving Licence
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Government-issued digital credential
          </p>
        </div>
      </div>

      {/* Digital Licence Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-100 dark:to-gray-50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm px-8 py-4 border-b border-white/20 dark:border-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-white dark:text-gray-900" />
                <span className="text-white dark:text-gray-900 font-semibold">Mauritian Driving Licence</span>
              </div>
              <div className="flex items-center gap-2 bg-green-500 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">VALID</span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column - Driver Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Driver Name</p>
                  <p className="text-white dark:text-gray-900 text-2xl font-bold">John Michael Smith</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Driver ID</p>
                    <p className="text-white dark:text-gray-900 font-semibold">DRV-001</p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Licence Number</p>
                    <p className="text-white dark:text-gray-900 font-semibold">MU/2024/AB123</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Licence Category</p>
                    <p className="text-white dark:text-gray-900 font-semibold">B, B+E</p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Date of Birth</p>
                    <p className="text-white dark:text-gray-900 font-semibold">15/03/1992</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Issue Date</p>
                  <p className="text-white dark:text-gray-900 font-semibold">01/01/2024</p>
                </div>
              </div>

              {/* Right Column - QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG
                    value="PERSOVAULT:LICENCE:DRV-001:MU/2024/AB123"
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

        {/* Compliance Data */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Compliance Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Compliance Status</p>
                <p className="font-semibold text-gray-900 dark:text-white">COMPLIANT</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Level</p>
                <p className="font-semibold text-green-600 dark:text-green-400">Low (15%)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trust Level</p>
                <p className="font-semibold text-gray-900 dark:text-white">High (85%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Licence Information */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Additional Licence Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Licence History
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  First issued: 15/03/2010 • Renewed: 01/01/2024
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Penalty Points
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current: 8 points • Maximum allowed: 12 points
                </p>
              </div>
              <button
                onClick={() => navigate("/app/driver/penalty-points")}
                className="text-xs text-primary hover:text-primary/80 font-medium underline"
              >
                View Details
              </button>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Endorsements
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No active endorsements on record
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}