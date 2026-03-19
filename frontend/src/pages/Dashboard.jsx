import Sidebar from "../components/Sidebar";
import RiskCard from "../components/RiskCard";
import RiskChart from "../charts/RiskChart";
import RiskGauge from "../components/RiskGauge";

function Dashboard() {

  return (

    <div className="dashboard-container">

      <Sidebar />

      <div className="dashboard-content">

        <h1>Driver Behaviour Dashboard</h1>

        <div className="card-grid">

          <RiskCard title="Driver ID" value="DRV10245" />
          <RiskCard title="Compliance Status" value="COMPLIANT" />
          <RiskCard title="Risk Level" value="MEDIUM" />
          <RiskCard title="Trust Level" value="HIGH" />

        </div>

        <RiskGauge probability={0.72} />

        <RiskChart />

      </div>

    </div>

  );

}

export default Dashboard;