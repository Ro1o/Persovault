import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, User, Lock, Phone, MapPin, ArrowLeft, Car, Badge as BadgeIcon, CreditCard, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import API_BASE_URL, { apiFetch } from "../../config/api";

// ─────────────────────────────────────────────────────────────
// CLIENT-SIDE NIC VALIDATION
// Mauritius NIC Format: Letter + DDMMYY + 6 digits + Letter
// First and last letter must be IDENTICAL
// Total: 14 characters  e.g. G010903016656G
// ─────────────────────────────────────────────────────────────

/** Layer 1 — Format: Letter + 12 digits + Letter, first = last */
function validateNICFormat(nic: string): { valid: boolean; message: string } {
  const pattern = /^[A-Z]\d{12}[A-Z]$/;
  if (!pattern.test(nic)) {
    return {
      valid: false,
      message: "Format: 1 letter + 12 digits + 1 letter, 14 chars total (e.g. G010903016656G)",
    };
  }
  if (nic[0] !== nic[nic.length - 1]) {
    return {
      valid: false,
      message: `First letter '${nic[0]}' must match last letter '${nic[nic.length - 1]}'`,
    };
  }
  return { valid: true, message: "Format valid" };
}

/** Layer 2 — DOB Consistency: digits 1-6 must match date of birth (DDMMYY) */
function validateDOBConsistency(nic: string, dateOfBirth: string): { valid: boolean; message: string } {
  if (!dateOfBirth) return { valid: true, message: "Enter date of birth to verify" };
  try {
    const nicDay   = nic.slice(1, 3);
    const nicMonth = nic.slice(3, 5);
    const nicYear  = nic.slice(5, 7);

    const parts   = dateOfBirth.split("-");
    const dobYear  = parts[0].slice(-2);
    const dobMonth = parts[1].padStart(2, "0");
    const dobDay   = parts[2].padStart(2, "0");

    if (nicDay === dobDay && nicMonth === dobMonth && nicYear === dobYear) {
      return { valid: true, message: `DOB ${nicDay}/${nicMonth}/${nicYear} matches ✓` };
    }
    return {
      valid: false,
      message: `DOB mismatch: NIC encodes ${nicDay}/${nicMonth}/${nicYear}, your DOB is ${dobDay}/${dobMonth}/${dobYear}`,
    };
  } catch {
    return { valid: false, message: "Could not validate DOB" };
  }
}

/** Honeypot check */
const HONEYPOT_NICS = new Set(["A000000000000A", "Z999999999999Z", "T000000000000T"]);

/** Combined client-side NIC validation */
function validateNIC(nic: string, dateOfBirth = ""): {
  valid: boolean;
  message: string;
  level: "ok" | "warning" | "error";
} {
  if (!nic) return { valid: false, message: "", level: "ok" };
  const upper = nic.toUpperCase();

  const fmt = validateNICFormat(upper);
  if (!fmt.valid) return { valid: false, message: fmt.message, level: "error" };

  if (HONEYPOT_NICS.has(upper)) {
    return { valid: false, message: "NIC is flagged in our security system", level: "error" };
  }

  const dob = validateDOBConsistency(upper, dateOfBirth);
  if (!dob.valid) return { valid: false, message: dob.message, level: "warning" };

  return { valid: true, message: "NIC passes all security checks ✓", level: "ok" };
}

function SignupForm() {
  const [role, setRole] = useState<"driver" | "police" | "admin">("driver");
  const [step, setStep] = useState<"role-select" | "form">("role-select");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [nicNumber, setNicNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nicValidation, setNicValidation] = useState<{
    valid: boolean;
    message: string;
    level: string;
  } | null>(null);

  const [licenceNumber, setLicenceNumber] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [station, setStation] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole: "driver" | "police" | "admin") => {
    setRole(selectedRole);
    setStep("form");
  };

  /** Live NIC validation as user types */
  const handleNICChange = (value: string) => {
    const upper = value.toUpperCase();
    setNicNumber(upper);
    if (upper.length >= 4) {
      setNicValidation(validateNIC(upper, dateOfBirth));
    } else {
      setNicValidation(null);
    }
  };

  /** Re-run NIC validation when DOB changes */
  const handleDOBChange = (value: string) => {
    setDateOfBirth(value);
    if (nicNumber.length === 14) {
      setNicValidation(validateNIC(nicNumber, value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setIsSubmitting(false);
      return;
    }

    if (role === "driver") {
      const nicCheck = validateNIC(nicNumber, dateOfBirth);
      if (!nicCheck.valid) {
        setError(`NIC validation failed: ${nicCheck.message}`);
        setIsSubmitting(false);
        return;
      }
      if (!dateOfBirth) {
        setError("Date of birth is required for NIC verification");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Step 1 — Create account
      const response = await apiFetch(`${API_BASE_URL}/signup`, {
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
        setIsSubmitting(false);
        return;
      }

      // Step 2 — Register NIC with 7-layer security (drivers only)
      if (role === "driver" && nicNumber) {
        const nicResponse = await apiFetch(`${API_BASE_URL}/register-nic`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            nic_number: nicNumber.toUpperCase(),
            full_name: fullName,
            date_of_birth: dateOfBirth,
          }),
        });

        if (!nicResponse.ok) {
          const nicErr = await nicResponse.json();
          const detail = nicErr.detail;
          if (typeof detail === "object") {
            setError(`NIC Security Check Failed (Score: ${detail.fraud_score}/100): ${detail.message}`);
          } else {
            setError(nicErr.detail || "NIC registration failed");
          }
          setIsSubmitting(false);
          return;
        }
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
    } finally {
      setIsSubmitting(false);
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
              <Link to="/login" className="text-primary hover:underline font-medium">Login here</Link>
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

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />Full Name
                  </label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="John Michael Smith" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />Phone Number
                  </label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+230 5789 1234" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />Address
                  </label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="123 Royal Road, Quatre Bornes" required />
                </div>
              </div>
            </div>

            {/* Driver Information + NIC Security */}
            {role === "driver" && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Driver Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Licence Number</label>
                    <input type="text" value={licenceNumber} onChange={(e) => setLicenceNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="MU/2024/AB123" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Vehicle Registration (Optional)</label>
                    <input type="text" value={vehicleRegistration} onChange={(e) => setVehicleRegistration(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="ABC 1234" />
                  </div>
                </div>

                {/* NIC Security Section */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                      NIC Identity Verification — 7-Layer Security
                    </h4>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-4">
                    Format: <strong>Letter + DD + MM + YY + 6 digits + Letter</strong> (first = last letter, 14 chars)<br />
                    Example: <strong>G010903016656G</strong> — born 01 September 2003
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <CreditCard className="w-4 h-4 inline mr-2" />NIC Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={nicNumber}
                          onChange={(e) => handleNICChange(e.target.value)}
                          className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary uppercase tracking-widest ${
                            nicValidation
                              ? nicValidation.valid
                                ? "border-green-500"
                                : nicValidation.level === "warning"
                                ? "border-orange-500"
                                : "border-red-500"
                              : "border-border"
                          }`}
                          placeholder="G010903016656G"
                          maxLength={14}
                          required
                        />
                        {nicValidation && (
                          <div className="absolute right-3 top-2.5">
                            {nicValidation.valid
                              ? <CheckCircle className="w-5 h-5 text-green-500" />
                              : nicValidation.level === "warning"
                              ? <AlertCircle className="w-5 h-5 text-orange-500" />
                              : <XCircle className="w-5 h-5 text-red-500" />
                            }
                          </div>
                        )}
                      </div>
                      {nicValidation && (
                        <p className={`text-xs mt-1 ${
                          nicValidation.valid ? "text-green-600"
                            : nicValidation.level === "warning" ? "text-orange-600"
                            : "text-red-600"
                        }`}>
                          {nicValidation.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => handleDOBChange(e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Police Information */}
            {role === "police" && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Police Officer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Badge Number</label>
                    <input type="text" value={badgeNumber} onChange={(e) => setBadgeNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="MPF-12345" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Police Station</label>
                    <input type="text" value={station} onChange={(e) => setStation(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Port Louis Police Station" required />
                  </div>
                </div>
              </div>
            )}

            {/* Admin Information */}
            {role === "admin" && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Administrator Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Employee ID</label>
                    <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="ADM-2024-001" required />
                  </div>
                </div>
              </div>
            )}

            {/* Account Credentials */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Credentials</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />Username
                  </label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="john.smith" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />Password
                    </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••" required minLength={8} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Lock className="w-4 h-4 inline mr-2" />Confirm Password
                    </label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••" required minLength={8} />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="pt-6 border-t border-border">
              <div className="mb-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" required />
                  <span className="text-sm text-muted-foreground">
                    I agree to the Terms of Service and Privacy Policy. I understand that this is a government identity system and all information provided must be accurate.
                  </span>
                </label>
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "Verifying identity..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">Login here</Link>
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