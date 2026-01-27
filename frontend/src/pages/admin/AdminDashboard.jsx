import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";
import StatCard from "../../components/dashboard/StatCard";
import PieChartView from "../../components/dashboard/PieChartView";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [allCauses, setAllCauses] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);

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

    fetchAllCauses();
  }, []);

  const fetchAllCauses = async (status = "all") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = status !== "all" ? { status } : {};
      const res = await axios.get("http://localhost:5000/api/admin/causes", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setAllCauses(res.data);
    } catch (err) {
      console.error("Failed to fetch causes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    fetchAllCauses(status);
  };

  const getStatusBadge = (cause) => {
    if (cause.adminStatus === "rejected") {
      return <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Rejected</span>;
    }
    if (cause.adminStatus === "approved" && cause.finalStatus === "approved") {
      return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Fully Approved</span>;
    }
    if (cause.adminStatus === "approved" && cause.dsStatus === "approved") {
      return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Approved by DS</span>;
    }
    if (cause.adminStatus === "approved" && cause.gsStatus === "approved") {
      return <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Approved by GS</span>;
    }
    if (cause.adminStatus === "approved") {
      return <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">Sent to GS</span>;
    }
    return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">Pending Review</span>;
  };

  if (!stats) return <p className="text-white p-6">Loading...</p>;

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="admin" />

      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-primary mb-8">
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
        <div className="bg-[#1F2937] p-6 rounded-xl mb-8">
          <h2 className="text-xl mb-4 text-primary">
            Cause Approval Distribution
          </h2>
          <PieChartView data={pieData} />
        </div>

        {/* RECEIVED CAUSES */}
        <div className="bg-[#1F2937] p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl text-primary">Received Causes</h2>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-4 py-2 rounded text-sm ${
                    filterStatus === status
                      ? "bg-primary text-white"
                      : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center py-4">Loading causes...</p>
          ) : allCauses.length === 0 ? (
            <p className="text-center py-4 text-gray-400">No causes found</p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {allCauses.map((cause) => (
                <div key={cause._id} className="bg-[#374151] p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-primary">{cause.title}</h3>
                    {getStatusBadge(cause)}
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{cause.description.substring(0, 100)}...</p>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>By: {cause.creator?.username}</span>
                    <span>{new Date(cause.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Amount: LKR {cause.requiredAmount.toLocaleString()} |
                    Area: {cause.areaName}, {cause.divisionName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
