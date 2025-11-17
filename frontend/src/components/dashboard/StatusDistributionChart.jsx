// components/StatusDistributionChart.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusDistributionChart = ({ approved, rejected, pending }) => {
  const data = {
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        label: "Status Distribution",
        data: [approved, rejected, pending],
        backgroundColor: ["#34C38F", "#F46A6A", "#F1C40F"],
        borderColor: ["#2E7B6F", "#C24040", "#C9A20D"],
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    cutout: "60%",
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: { size: 14 },
        },
      },
    },
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[#111] p-6 rounded-xl shadow-lg">
      <h2 className="text-lg font-semibold text-white mb-4">Status Distribution</h2>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default StatusDistributionChart;
