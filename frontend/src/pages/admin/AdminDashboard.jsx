import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";
import StatCard from "../../components/dashboard/StatCard";
import PieChartView from "../../components/dashboard/PieChartView";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch(console.error);

    axios
      .get("http://localhost:5000/api/admin/analytics/pie", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPieData([
          { name: "Pending Admin", value: res.data.pendingAdmin, color: "#FACC15" },
          { name: "Sent to GS", value: res.data.sentToGS, color: "#3B82F6" },
          { name: "Under DS", value: res.data.underDS, color: "#8B5CF6" },
          { name: "Fully Approved", value: res.data.fullyApproved, color: "#22C55E" },
          { name: "Rejected by Admin", value: res.data.rejected, color: "#EF4444" },
        ]);
      })
      .catch(console.error);
  }, []);

  if (!stats) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="admin" />

      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-[#26bfef] mb-8">
          Admin Dashboard
        </h1>

        {/* STAT BOXES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6 mb-10">
          <StatCard title="Total Causes" value={stats.totalCauses} />
          <StatCard title="Pending Admin" value={stats.pendingAdmin} />
          <StatCard title="Approved by Admin" value={stats.approvedByAdmin} />
          <StatCard title="Rejected by Admin" value={stats.rejectedByAdmin} />
          <StatCard title="Sent to GS" value={stats.sentToGS} />
          <StatCard title="Under DS Approval" value={stats.underDS} />
          <StatCard title="Fully Approved" value={stats.fullyApproved} />
        </div>

        {/* PIE CHART */}
        <div className="bg-[#1F2937] p-6 rounded-xl">
          <h2 className="text-xl mb-4 text-[#26bfef]">
            Cause Approval Distribution
          </h2>
          <PieChartView data={pieData} />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
