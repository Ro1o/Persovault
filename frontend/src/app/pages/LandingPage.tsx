import { Link } from "react-router-dom";
import { Shield, Scan, BarChart3, Lock, Zap, CheckCircle, ArrowRight, Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          {/* Logo and Navigation */}
          <nav className="flex items-center justify-between mb-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
                <Shield className="w-7 h-7 text-white dark:text-gray-900" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">PersoVault</span>
            </div>
            <div className="flex gap-4">
              <Link
  to="/login"
  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
>
  Sign In
</Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={toggleTheme}
                className="px-6 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center gap-2"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-gray-900 dark:text-gray-100 text-sm mb-6">
              <Lock className="w-4 h-4" />
              Government-Grade Security
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Next-Generation Digital
              <br />
              <span className="bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white bg-clip-text text-transparent">
                Identity Verification
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              PersoVault is a secure, government-grade digital identity wallet system for driver verification and behavioral compliance monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="px-8 py-4 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                Launch Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-900 dark:text-white rounded-lg font-medium transition-colors border border-gray-900 dark:border-white"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-100 dark:to-white rounded-xl p-6 border border-gray-800 dark:border-gray-200 text-center">
              <div className="text-4xl font-bold text-white dark:text-gray-900 mb-2">99.9%</div>
              <div className="text-gray-300 dark:text-gray-600">System Uptime</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-100 dark:to-white rounded-xl p-6 border border-gray-800 dark:border-gray-200 text-center">
              <div className="text-4xl font-bold text-white dark:text-gray-900 mb-2">&lt;2s</div>
              <div className="text-gray-300 dark:text-gray-600">Verification Time</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-100 dark:to-white rounded-xl p-6 border border-gray-800 dark:border-gray-200 text-center">
              <div className="text-4xl font-bold text-white dark:text-gray-900 mb-2">256-bit</div>
              <div className="text-gray-300 dark:text-gray-600">Encryption</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Powerful Features for Every Role
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Three specialized interfaces designed for drivers, law enforcement, and administrators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Driver Feature */}
          <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-100 dark:to-white rounded-xl p-8 border border-gray-800 dark:border-gray-200 hover:border-gray-700 dark:hover:border-gray-300 transition-colors">
            <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Shield className="w-7 h-7 text-white dark:text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-3">Driver Dashboard</h3>
            <p className="text-gray-300 dark:text-gray-600">
              Personal dashboard with AI risk assessment, digital passport, and compliance monitoring
            </p>
          </div>

          {/* Police Feature */}
          <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-100 dark:to-white rounded-xl p-8 border border-gray-800 dark:border-gray-200 hover:border-gray-700 dark:hover:border-gray-300 transition-colors">
            <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Scan className="w-7 h-7 text-white dark:text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-3">Police Console</h3>
            <p className="text-gray-300 dark:text-gray-600">
              Roadside verification console with QR scanning and real-time driver information
            </p>
          </div>

          {/* Admin Feature */}
          <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-100 dark:to-white rounded-xl p-8 border border-gray-800 dark:border-gray-200 hover:border-gray-700 dark:hover:border-gray-300 transition-colors">
            <div className="w-14 h-14 bg-white/10 dark:bg-black/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <BarChart3 className="w-7 h-7 text-white dark:text-gray-900" />
            </div>
            <h3 className="text-xl font-bold text-white dark:text-gray-900 mb-3">Admin Portal</h3>
            <p className="text-gray-300 dark:text-gray-600">
              System-wide monitoring, driver search, AI analytics, and comprehensive user management
            </p>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-gradient-to-br from-gray-900 to-black dark:from-gray-100 dark:to-white rounded-2xl p-12 border border-gray-800 dark:border-gray-200">
          <h3 className="text-3xl font-bold mb-8 text-center text-white dark:text-gray-900">Why Choose PersoVault?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1 text-white dark:text-gray-900" />
              <div>
                <h4 className="font-bold mb-2 text-white dark:text-gray-900">Military-Grade Encryption</h4>
                <p className="text-gray-300 dark:text-gray-600">256-bit encryption ensures your data stays secure</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 flex-shrink-0 mt-1 text-white dark:text-gray-900" />
              <div>
                <h4 className="font-bold mb-2 text-white dark:text-gray-900">Real-Time Verification</h4>
                <p className="text-gray-300 dark:text-gray-600">Instant identity verification in under 2 seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <BarChart3 className="w-6 h-6 flex-shrink-0 mt-1 text-white dark:text-gray-900" />
              <div>
                <h4 className="font-bold mb-2 text-white dark:text-gray-900">AI-Powered Analytics</h4>
                <p className="text-gray-300 dark:text-gray-600">Advanced behavioral analysis and risk assessment</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 flex-shrink-0 mt-1 text-white dark:text-gray-900" />
              <div>
                <h4 className="font-bold mb-2 text-white dark:text-gray-900">Compliance Monitoring</h4>
                <p className="text-gray-300 dark:text-gray-600">Automated tracking of driver behavior and compliance</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 flex-shrink-0 mt-1 text-white dark:text-gray-900" />
              <div>
                <h4 className="font-bold mb-2 text-white dark:text-gray-900">Multi-Platform Support</h4>
                <p className="text-gray-300 dark:text-gray-600">Fully responsive across desktop, tablet, and mobile</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 flex-shrink-0 mt-1 text-white dark:text-gray-900" />
              <div>
                <h4 className="font-bold mb-2 text-white dark:text-gray-900">Role-Based Access</h4>
                <p className="text-gray-300 dark:text-gray-600">Secure permissions for drivers, police, and admins</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 dark:border-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white dark:text-gray-900" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">PersoVault</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2026 PersoVault. Government-Grade Digital Identity System. | Developed by Rohaj Gokool Oopadhya
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
