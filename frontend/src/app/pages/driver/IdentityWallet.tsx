import { Link } from "react-router-dom";
import { CreditCard, FileText, ArrowRight, Fingerprint, Plane } from "lucide-react";

export function IdentityWallet() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Identity Wallet
        </h1>
        <p className="text-muted-foreground">
          Your secure digital identity credentials
        </p>
      </div>

      {/* Digital Cards Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Digital NIC Card */}
        <Link
          to="/app/driver/nic"
          className="group block"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-100 dark:to-gray-50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Fingerprint className="w-7 h-7 text-white dark:text-gray-900" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/70 dark:text-gray-600 group-hover:text-white dark:group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
            </div>
            
            <h2 className="text-2xl font-bold text-white dark:text-gray-900 mb-2">
              Digital National Identity Card
            </h2>
            <p className="text-gray-300 dark:text-gray-600 mb-6">
              Republic of Mauritius
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/90 dark:text-gray-700">Valid & Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/90 dark:text-gray-700">NIC No: M0101925M001</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Digital Driving Licence Card */}
        <Link
          to="/app/driver/licence"
          className="group block"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-100 dark:to-gray-50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CreditCard className="w-7 h-7 text-white dark:text-gray-900" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/70 dark:text-gray-600 group-hover:text-white dark:group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
            </div>
            
            <h2 className="text-2xl font-bold text-white dark:text-gray-900 mb-2">
              Digital Driving Licence
            </h2>
            <p className="text-gray-300 dark:text-gray-600 mb-6">
              Mauritian Licence • Valid until 2034
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/90 dark:text-gray-700">Valid & Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/90 dark:text-gray-700">Licence No: MU/2024/AB123</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Digital Travel Passport Card */}
        <Link
          to="/app/driver/travel-passport"
          className="group block"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-100 dark:to-gray-50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Plane className="w-7 h-7 text-white dark:text-gray-900" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/70 dark:text-gray-600 group-hover:text-white dark:group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
            </div>
            
            <h2 className="text-2xl font-bold text-white dark:text-gray-900 mb-2">
              Digital Travel Passport
            </h2>
            <p className="text-gray-300 dark:text-gray-600 mb-6">
              Republic of Mauritius
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/90 dark:text-gray-700">Valid until 2034</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/90 dark:text-gray-700">Passport No: P1234567</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Digital Behaviour Passport Card */}
        <Link
          to="/app/driver/passport"
          className="group block"
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-100 dark:to-gray-50 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-7 h-7 text-white dark:text-gray-900" />
              </div>
              <ArrowRight className="w-6 h-6 text-white/70 dark:text-gray-600 group-hover:text-white dark:group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
            </div>
            
            <h2 className="text-2xl font-bold text-white dark:text-gray-900 mb-2">
              Digital Behaviour Passport
            </h2>
            <p className="text-gray-300 dark:text-gray-600 mb-6">
              AI Compliance Document
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/90 dark:text-gray-700">Compliant Status</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/90 dark:text-gray-700">Low Risk Level</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white/90 dark:text-gray-700">High Trust Score</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Info Panel */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
          About Your Digital Wallet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Your digital identity credentials are securely stored and encrypted. These documents can be verified by authorized personnel using QR code scanning. All access is logged for security purposes.
        </p>
      </div>
    </div>
  );
}