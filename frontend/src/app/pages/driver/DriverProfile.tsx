import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Key,
  Clock,
  Edit,
  Lock,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";

import { useState, useEffect } from "react";
import { DriverRiskPanel } from "../../components/DriverRiskPanel";
import API_BASE_URL from "../../../config/api";

interface Profile {
  username:  string;
  role:      string;
  full_name: string;
  phone:     string;
  address:   string;
  driver_id: string;
}

export function DriverProfile() {

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Change password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
  );

  const driver = {
    driver_id:                 profile?.driver_id || "DRV-2026-DEMO",
    current_points:            2,
    previous_points:           1,
    offences_last_12m:         1,
    minor_offences:            1,
    moderate_offences:         0,
    severe_offences:           0,
    days_since_last_offence:   145,
    avg_days_between_offences: 300,
    years_since_licence_issue: 3,
    last_sync: new Date().toISOString(),
  };

  // Fetch real profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/profile/${user.username}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch {
        // fallback to localStorage data if server unreachable
        setProfile({
          username:  user.username  || "—",
          role:      user.role      || "driver",
          full_name: user.full_name || "—",
          phone:     "—",
          address:   "—",
          driver_id: user.driver_id || "—",
        });
      } finally {
        setLoading(false);
      }
    };
    if (user.username) fetchProfile();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username:         user.username,
          current_password: currentPassword,
          new_password:     newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(data.detail || "Failed to change password");
      }
    } catch {
      setPasswordError("Cannot connect to server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Driver Profile</h1>
        <p className="text-muted-foreground">View and manage your personal information</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-card rounded-lg p-8 border border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
            <User className="w-16 h-16 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {loading ? "Loading..." : profile?.full_name || "—"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Driver ID</p>
                <p className="text-lg font-semibold text-foreground font-mono">
                  {profile?.driver_id || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="text-lg font-semibold text-foreground">
                  {profile?.username || "—"}
                </p>
              </div>
            </div>
            <button className="px-6 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center gap-2 mx-auto md:mx-0">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* AI Driver Risk Panel */}
      <DriverRiskPanel driver={driver} />

      {/* Personal Information */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-semibold text-foreground">{profile?.full_name || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-semibold text-foreground">{profile?.address || "—"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-semibold text-foreground">{profile?.phone || "—"}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Account Security */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-6">Account Security</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-semibold text-foreground">{profile?.username || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Last Login</p>
              <p className="font-semibold text-foreground">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => { setShowPasswordModal(true); setPasswordError(""); setPasswordSuccess(""); }}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <Key className="w-4 h-4" />
            Change Password
          </button>
          <button className="px-6 py-2 border border-gray-900 dark:border-white rounded-lg flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Enable 2FA
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-md p-6">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-900 dark:text-white" />
                <h3 className="text-lg font-semibold text-foreground">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">

              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter current password"
                    required
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Repeat new password"
                    required
                    minLength={8}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">{passwordError}</p>
                </div>
              )}

              {/* Success */}
              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">{passwordSuccess}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}