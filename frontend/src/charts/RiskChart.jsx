import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function RiskChart() {

  const data = {
    labels: ["Minor Offences", "Moderate Offences", "Severe Offences"],

    datasets: [
      {
        label: "Driver Offence Profile",
        data: [3, 2, 1],   // sample data
      }
    ]
  };

  return (
    <div style={{ width: "600px", marginTop: "40px" }}>
      <Bar data={data} />
    </div>
  );
}

export default RiskChart;