import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, User, Lock, Phone, MapPin, ArrowLeft, Car, Badge as BadgeIcon } from "lucide-react";

function SignupForm() {
  const [role, setRole] = useState<"driver" | "police" | "admin">("driver");
  const [step, setStep] = useState<"role-select" | "form">("role-select");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [licenceNumber, setLicenceNumber] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");

  const [badgeNumber, setBadgeNumber] = useState("");
  const [station, setStation] = useState("");

  const [employeeId, setEmployeeId] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole: "driver" | "police" | "admin") => {
    setRole(selectedRole);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role,
          full_name: fullName,
          phone,
          address,
          licence_number: licenceNumber,
          vehicle_registration: vehicleRegistration,
          badge_number: badgeNumber,
          station,
          employee_id: employeeId,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setError(err.detail || "Signup failed");
        return;
      }

      const user = await response.json();
      localStorage.setItem("user", JSON.stringify(user));

      const routes = {
        driver: "/app/driver/dashboard",
        police: "/app/police/verification",
        admin: "/app/admin/dashboard",
      };

      navigate(routes[user.role as "driver" | "police" | "admin"]);
    } catch {
      setError("Cannot connect to server");
    }
  };

  if (step === "role-select") {
    const roles = [
      {
        value: "driver" as const,
        label: "Driver",
        icon: Car,
        active: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        description: "Manage your digital credentials and compliance tracking",
      },
      {
        value: "police" as const,
        label: "Police Officer",
        icon: BadgeIcon,
        active: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        description: "Verify driver credentials and record violations",
      },
      {
        value: "admin" as const,
        label: "Administrator",
        icon: Shield,
        active: "bg-purple-100 dark:bg-purple-900/30",
        iconColor: "text-purple-600 dark:text-purple-400",
        description: "Manage system-wide operations and analytics",
      },
    ];

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Shield className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create PersoVault Account</h1>
            <p className="text-muted-foreground">Select your account type to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {roles.map(({ value, label, icon: Icon, active, iconColor, description }) => (
              <button
                key={value}
                onClick={() => handleRoleSelect(value)}
                className="bg-card border-2 border-border hover:border-primary rounded-xl p-8 transition-all hover:shadow-lg group"
              >
                <div className={`w-16 h-16 ${active} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{label}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const roleConfig = {
    driver: { icon: Car, active: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-400" },
    police: { icon: BadgeIcon, active: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600 dark:text-green-400" },
    admin: { icon: Shield, active: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400" },
  };

  const { icon: RoleIcon, active, iconColor } = roleConfig[role];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <button
          onClick={() => setStep("role-select")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Role
        </button>

        <div className="bg-card rounded-xl shadow-xl p-8 border border-border">
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 ${active} rounded-xl flex items-center justify-center ${iconColor}`}>
              <RoleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {role.charAt(0).toUpperCase() + role.slice(1)} Registration
              </h2>
              <p className="text-sm text-muted-foreground">Create your PersoVault account</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Michael Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+230 5789 1234"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="123 Royal Road, Quatre Bornes"
                    required
                  />
                </div>
              </div>
            </div>

            {role === "driver" && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Driver Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Licence Number</label>
                    <input
                      type="text"
                      value={licenceNumber}
                      onChange={(e) => setLicenceNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="MU/2024/AB123"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Vehicle Registration (Optional)</label>
                    <input
                      type="text"
                      value={vehicleRegistration}
                      onChange={(e) => setVehicleRegistration(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="ABC 1234"
                    />
                  </div>
                </div>
              </div>
            )}

            {role === "police" && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Police Officer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Badge Number</label>
                    <input
                      type="text"
                      value={badgeNumber}
                      onChange={(e) => setBadgeNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="MPF-12345"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Police Station</label>
                    <input
                      type="text"
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Port Louis Police Station"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {role === "admin" && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Administrator Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Employee ID</label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="ADM-2024-001"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john.smith"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                      required
                      minLength={8}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="pt-6 border-t border-border">
              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" required />
                  <span className="text-sm text-muted-foreground">
                    I agree to the Terms of Service and Privacy Policy. I understand that this is a government identity system and all information provided must be accurate.
                  </span>
                </label>
              </div>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  return <SignupForm />;
}