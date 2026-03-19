import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Shield,
  Key,
  Clock,
  Edit,
  Car,
  FileText,
  ClipboardCheck,
  Download,
  Eye
} from "lucide-react";

import { DriverRiskPanel } from "../../components/DriverRiskPanel";

export function DriverProfile() {

  const driver = {
    driver_id: "DRV001",

    current_points: 6,
    previous_points: 4,

    offences_last_12m: 3,
    minor_offences: 1,
    moderate_offences: 1,
    severe_offences: 1,

    days_since_last_offence: 45,
    avg_days_between_offences: 120,
    years_since_licence_issue: 8,

    last_sync: new Date().toISOString()
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Driver Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your personal information
        </p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-card rounded-lg p-8 border border-border shadow-sm">

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">

          <div className="w-32 h-32 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
            <User className="w-16 h-16 text-gray-600 dark:text-gray-400" />
          </div>

          <div className="flex-1 text-center md:text-left">

            <h2 className="text-2xl font-bold text-foreground mb-2">
              John Michael Smith
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

              <div>
                <p className="text-sm text-muted-foreground">Driver ID</p>
                <p className="text-lg font-semibold text-foreground">
                  DRV-001
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Licence Number</p>
                <p className="text-lg font-semibold text-foreground">
                  MU/2024/AB123
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Compliance Status</p>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                  COMPLIANT
                </span>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Trust Level</p>
                <p className="text-lg font-semibold text-foreground">
                  85%
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

        <h2 className="text-lg font-semibold text-foreground mb-6">
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-semibold text-foreground">
                John Michael Smith
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-semibold text-foreground">
                15 March 1990
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Blood Group</p>
              <p className="font-semibold text-foreground">O+</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-semibold text-foreground">
                123 Royal Road, Quatre Bornes, Mauritius
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-semibold text-foreground">
                +230 5789 1234
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold text-foreground">
                john.smith@email.com
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Account Security */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">

        <h2 className="text-lg font-semibold text-foreground mb-6">
          Account Security
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-semibold text-foreground">
                john.smith
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-900 dark:text-white" />
            <div>
              <p className="text-sm text-muted-foreground">Last Login</p>
              <p className="font-semibold text-foreground">
                14 Mar 2026 - 08:30
              </p>
            </div>
          </div>

        </div>

        <div className="flex gap-4 mt-6">

          <button className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg flex items-center gap-2">
            <Key className="w-4 h-4" />
            Update Password
          </button>

          <button className="px-6 py-2 border border-gray-900 dark:border-white rounded-lg flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Enable 2FA
          </button>

        </div>

      </div>

    </div>
  );
}