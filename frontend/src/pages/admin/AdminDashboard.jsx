import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

// Chart.js Imports
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  if (!data) return <p className="text-white p-8">Loading...</p>;

  // Pie Chart Data
  const chartData = {
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        data: [
          data.statusDistribution.approved,
          data.statusDistribution.rejected,
          data.statusDistribution.pending,
        ],
        backgroundColor: ["#34C38F", "#F46A6A", "#F1C40F"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "white", font: { size: 12 } },
      },
    },
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="admin" />

      <main className="flex-1 p-6 md:ml-64">
        <h1 className="text-2xl font-semibold text-[#26bfef] mb-6">
          Admin Dashboard
        </h1>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Stat label="Total Causes" value={data.totalCauses} />
          <Stat label="Approval Rate" value={`${data.approvalRate}%`} />
          <Stat label="Pending" value={data.pendingCauses} />
          <Stat label="Active Creators" value={data.activeCreators} />
        </div>

        {/* Status Breakdown + Pie chart */}
        <div className="bg-[#1F2937] p-5 rounded-xl shadow mb-8">
          <h2 className="text-lg font-semibold text-[#26bfef] mb-4">
            Status Breakdown
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            {/* Left Text */}
            <ul className="space-y-1 text-gray-300 text-sm">
              <li>✔ Approved: {data.statusDistribution.approved}</li>
              <li>✖ Rejected: {data.statusDistribution.rejected}</li>
              <li>⏳ Pending: {data.statusDistribution.pending}</li>
            </ul>

            {/* Compact Pie Chart */}
            <div className="w-[220px] mx-auto">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-[#1F2937] p-5 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-[#26bfef] mb-4">
            Recent Activities
          </h2>

          {data.recentActivities.map((activity) => (
            <div
              key={activity._id}
              className="p-3 border-b border-gray-700 text-sm flex justify-between"
            >
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-xs text-gray-400">
                  By {activity.creator.username}
                </p>
              </div>

             <span
  className={`capitalize px-3 py-1 rounded-full text-xs font-medium text-center flex items-center justify-center min-w-[80px] ${
    activity.status === "approved"
      ? "bg-green-600/30 text-green-300 border border-green-600"
      : activity.status === "rejected"
      ? "bg-red-600/30 text-red-300 border border-red-600"
      : "bg-yellow-600/30 text-yellow-300 border border-yellow-600"
  }`}
>
  {activity.status}
</span>

            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-[#1F2937] p-4 text-center rounded-lg shadow">
    <p className="text-gray-400 text-xs">{label}</p>
    <h3 className="text-xl font-bold text-[#26bfef]">{value}</h3>
  </div>
);

export default AdminDashboard;
