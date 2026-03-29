import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Shield, Calendar, User, CreditCard, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import API_BASE_URL, { apiFetch } from "../../../config/api";

interface LicenceData {
  full_name:     string;
  driver_id:     string;
  date_of_birth: string;
  nic_number:    string;
  username:      string;
  phone:         string;
  address:       string;
}

interface StatsData {
  total_points:  number;
  clean_days:    number;
  active_count:  number;
  is_suspended:  boolean;
}

// Generate deterministic licence number from driver_id
function generateLicenceNumber(driverId: string): string {
  const year = new Date().getFullYear();
  const suffix = driverId?.split("-")[2] || "AB123";
  return `MU/${year}/${suffix.slice(0, 6)}`;
}

// Format DOB from YYYY-MM-DD to DD/MM/YYYY
function formatDOB(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const parts = dateStr.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  } catch {
    return dateStr;
  }
}

// Issue date = 2 years ago
function getIssueDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 2);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

export function DigitalLicence() {
  const navigate = useNavigate();

  const [licence, setLicence]   = useState<LicenceData | null>(null);
  const [stats, setStats]       = useState<StatsData | null>(null);
  const [loading, setLoading]   = useState(true);

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profile + NIC in parallel
      const [profileRes, nicRes] = await Promise.all([
        apiFetch(`${API_BASE_URL}/profile/${user.username}`),
        apiFetch(`${API_BASE_URL}/verify-nic/${user.username}`),
      ]);

      const profileData = profileRes.ok ? await profileRes.json() : {};
      const nicData     = nicRes.ok     ? await nicRes.json()     : {};

      setLicence({
        full_name:     profileData.full_name  || user.full_name || "—",
        driver_id:     profileData.driver_id  || user.driver_id || "—",
        date_of_birth: nicData.date_of_birth  || "",
        nic_number:    nicData.nic_number      || "—",
        username:      user.username,
        phone:         profileData.phone       || "—",
        address:       profileData.address     || "—",
      });

      // Fetch driver stats for penalty points
      if (profileData.driver_id) {
        const statsRes = await apiFetch(`${API_BASE_URL}/driver-stats/${profileData.driver_id}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      }
    } catch {
      setLicence({
        full_name:     user.full_name || "—",
        driver_id:     user.driver_id || "—",
        date_of_birth: "",
        nic_number:    "—",
        username:      user.username,
        phone:         "—",
        address:       "—",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const licenceNumber = licence ? generateLicenceNumber(licence.driver_id) : "—";
  const dobFormatted  = licence ? formatDOB(licence.date_of_birth) : "—";
  const issueDate     = getIssueDate();
  const totalPoints   = stats?.total_points ?? 0;
  const suspRisk      = Math.min(Math.round((totalPoints / 12) * 100), 100);
  const riskLabel     = suspRisk <= 25 ? "Low" : suspRisk <= 60 ? "Medium" : "High";
  const riskColor     = suspRisk <= 25
    ? "text-green-600 dark:text-green-400"
    : suspRisk <= 60
    ? "text-orange-600 dark:text-orange-400"
    : "text-red-600 dark:text-red-400";
  const trustPct      = Math.max(100 - suspRisk, 0);
  const isCompliant = !(stats?.is_suspended ?? false);

  const qrValue = licence
    ? `PERSOVAULT:LICENCE:${licence.driver_id}:${licenceNumber}:${licence.full_name}`
    : "PERSOVAULT:LICENCE:LOADING";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/driver/wallet")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Digital Driving Licence
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Government-issued digital credential</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Loading licence data...
        </div>
      )}

      {!loading && licence && (
      <div className="max-w-4xl mx-auto">

        {/* Digital Licence Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-950 dark:from-gray-100 dark:to-gray-50 rounded-2xl shadow-2xl overflow-hidden">

          {/* Card Header */}
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-sm px-8 py-4 border-b border-white/20 dark:border-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-white dark:text-gray-900" />
                <span className="text-white dark:text-gray-900 font-semibold">Mauritian Driving Licence</span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${isCompliant ? "bg-green-500" : "bg-red-500"}`}>
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">
                  {isCompliant ? "VALID" : "SUSPENDED"}
                </span>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Left & Center — Licence Info */}
              <div className="md:col-span-2 space-y-6">
                <div>
                  <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Driver Name</p>
                  <p className="text-white dark:text-gray-900 text-2xl font-bold">{licence.full_name}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Driver ID</p>
                    <p className="text-white dark:text-gray-900 font-semibold font-mono">{licence.driver_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Licence Number</p>
                    <p className="text-white dark:text-gray-900 font-semibold">{licenceNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Licence Category</p>
                    <p className="text-white dark:text-gray-900 font-semibold">B, B+E</p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Date of Birth</p>
                    <p className="text-white dark:text-gray-900 font-semibold">{dobFormatted}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">Issue Date</p>
                    <p className="text-white dark:text-gray-900 font-semibold">{issueDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-300 dark:text-gray-600 text-sm mb-1">NIC Number</p>
                    <p className="text-white dark:text-gray-900 font-semibold font-mono text-sm">{licence.nic_number}</p>
                  </div>
                </div>
              </div>

              {/* Right Column — QR Code */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG
                    value={qrValue}
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Compliance Data</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isCompliant ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"
              }`}>
                <CheckCircle className={`w-5 h-5 ${isCompliant ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Compliance Status</p>
                <p className={`font-semibold ${isCompliant ? "text-gray-900 dark:text-white" : "text-red-600 dark:text-red-400"}`}>
                  {isCompliant ? "COMPLIANT" : "SUSPENDED"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk Level</p>
                <p className={`font-semibold ${riskColor}`}>{riskLabel} ({suspRisk}%)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trust Level</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {trustPct >= 75 ? "High" : trustPct >= 50 ? "Medium" : "Low"} ({trustPct}%)
                </p>
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
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Licence History</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  First issued: {issueDate} • Status: {isCompliant ? "Active" : "Suspended"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Penalty Points</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current: {totalPoints} points • Maximum allowed: 12 points
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
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Endorsements</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {totalPoints === 0
                    ? "No endorsements on record"
                    : `${stats?.active_count ?? 0} active endorsement${(stats?.active_count ?? 0) !== 1 ? "s" : ""} on record`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}