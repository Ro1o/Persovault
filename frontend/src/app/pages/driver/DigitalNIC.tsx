import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield } from "lucide-react";
const coatOfArms = "/coat-of-arms.png";

export function DigitalNIC() {
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
            Digital National Identity Card
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Republic of Mauritius
          </p>
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
              <div className="flex items-center gap-2 bg-green-500 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">VALID</span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            <div className="flex items-start gap-8">
              {/* Left Column - Photo and Coat of Arms */}
              <div className="flex-shrink-0 space-y-6">
                {/* Mauritius Coat of Arms */}
                <div className="w-24 h-24 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm p-2">
                  <img src={coatOfArms} alt="Mauritius Coat of Arms" className="w-full h-full object-contain" />
                </div>
                
                {/* Profile Photo Placeholder */}
                <div className="w-32 h-40 bg-white/20 dark:bg-black/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white/70 dark:text-gray-900/70 text-sm">
                    Photo
                  </div>
                </div>
              </div>

              {/* Right Column - NIC Information */}
              <div className="flex-1 space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-white dark:text-gray-900 text-xl font-bold mb-1">National Identity Card</h2>
                  <p className="text-gray-300 dark:text-gray-600 text-sm">Carte d'Identité Nationale</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Full Name</p>
                    <p className="text-white dark:text-gray-900 text-xl font-bold">John Michael Smith</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">NIC Number</p>
                    <p className="text-white dark:text-gray-900 font-semibold">M0101925M001</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Date of Birth</p>
                    <p className="text-white dark:text-gray-900 font-semibold">15/03/1992</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Gender</p>
                    <p className="text-white dark:text-gray-900 font-semibold">Male</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Nationality</p>
                    <p className="text-white dark:text-gray-900 font-semibold">Mauritian</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Issue Date</p>
                    <p className="text-white dark:text-gray-900 font-semibold">01/01/2020</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Expiry Date</p>
                    <p className="text-white dark:text-gray-900 font-semibold">01/01/2030</p>
                  </div>
                </div>

                {/* Signature Area */}
                <div className="pt-4 border-t border-white/20 dark:border-black/20">
                  <p className="text-gray-300 dark:text-gray-600 text-xs mb-2">Signature</p>
                  <div className="h-12 bg-white/10 dark:bg-black/10 rounded-lg flex items-center px-4">
                    <span className="text-white/50 dark:text-gray-900/50 italic text-sm">Digital Signature</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Footer - Mauritius Flag Colors */}
          <div className="h-3 grid grid-cols-4">
            <div className="bg-red-600"></div>
            <div className="bg-blue-600"></div>
            <div className="bg-yellow-400"></div>
            <div className="bg-green-600"></div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Document Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Document Status
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Valid and verified by the National Identity Card Authority of Mauritius
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Verification
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  This digital identity card is legally recognized and can be used for official identification purposes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}