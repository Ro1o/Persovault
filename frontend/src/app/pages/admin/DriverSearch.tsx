import { useState } from "react";
import { Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockDrivers = [
  {
    id: "DRV-001",
    name: "John Smith",
    licenceNumber: "MU/2024/AB123",
    complianceStatus: "COMPLIANT",
    riskLevel: "Low",
    lastUpdate: "2024-03-13 14:32",
  },
  {
    id: "DRV-002",
    name: "Sarah Johnson",
    licenceNumber: "MU/2024/CD456",
    complianceStatus: "COMPLIANT",
    riskLevel: "Medium",
    lastUpdate: "2024-03-12 10:15",
  },
  {
    id: "DRV-003",
    name: "Michael Brown",
    licenceNumber: "MU/2024/EF789",
    complianceStatus: "AT RISK",
    riskLevel: "High",
    lastUpdate: "2024-03-11 16:45",
  },
  {
    id: "DRV-004",
    name: "Emily Davis",
    licenceNumber: "MU/2024/GH012",
    complianceStatus: "COMPLIANT",
    riskLevel: "Low",
    lastUpdate: "2024-03-10 09:20",
  },
  {
    id: "DRV-005",
    name: "David Wilson",
    licenceNumber: "MU/2024/IJ345",
    complianceStatus: "COMPLIANT",
    riskLevel: "Medium",
    lastUpdate: "2024-03-09 13:55",
  },
];

export function DriverSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredDrivers = mockDrivers.filter(
    (driver) =>
      driver.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.licenceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (risk: string) => {
    if (risk === "Low") return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
    if (risk === "Medium") return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400";
    return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
  };

  const getComplianceColor = (status: string) => {
    if (status === "COMPLIANT") return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400";
    return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Driver Search
        </h1>
        <p className="text-muted-foreground">
          Search and manage driver records
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, name, or licence number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Driver ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Licence Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-primary/10 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {driver.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-foreground">{driver.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {driver.licenceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getComplianceColor(driver.complianceStatus)}`}>
                      {driver.complianceStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskColor(driver.riskLevel)}`}>
                      {driver.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {driver.lastUpdate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => navigate(`/app/admin/drivers/${driver.id}`)}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}