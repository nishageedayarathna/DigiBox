// DSDashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { fetchDSDashboard, fetchDSAllCauses } from "../../services/dsService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import UserProfileMenu from "../../components/dashboard/UserProfileMenu";


// Spinner Component
const Spinner = ({ size = 16, text = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center w-full h-full">
    <div
      className={`w-${size} h-${size} border-4 border-blue-500 border-t-transparent rounded-full animate-spin`}
    ></div>
    <p className="text-white text-lg mt-3">{text}</p>
  </div>
);

const DSDashboard = () => {
  const [stats, setStats] = useState(null);
  const [area, setArea] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allCauses, setAllCauses] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [causesLoading, setCausesLoading] = useState(false);

  useEffect(() => {
    fetchDSDashboard()
      .then((res) => {
        const data = res.data;

        setStats({
          pending: data.pendingCauses,
          approved: data.approvedCauses,
          rejected: data.rejectedCauses,
        });

        setArea({
          district: data.welcomeInfo.dsOfficer.district,
          division: data.welcomeInfo.dsOfficer.division,
        });

        setMonthlyAnalytics(data.monthlyAnalytics || []);
        setUser({
          username: data.welcomeInfo.dsOfficer.username,
          email: data.welcomeInfo.dsOfficer.email,
          profileImage: data.welcomeInfo.dsOfficer.profileImage || "/assets/images/user.webp",
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const fetchAllCauses = async (status = "all") => {
    setCausesLoading(true);
    try {
      const res = await fetchDSAllCauses(status);
      setAllCauses(res.data);
    } catch (err) {
      console.error("Failed to fetch causes:", err);
    } finally {
      setCausesLoading(false);
    }
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    fetchAllCauses(status);
  };

  const getStatusBadge = (cause) => {
    if (cause.dsStatus === "rejected") {
      return <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">Rejected</span>;
    }
    if (cause.dsStatus === "approved") {
      return <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Approved</span>;
    }
    return <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">Pending Review</span>;
  };

  // Centered Loading for initial dashboard
  if (loading) {
    return (
      <div className="bg-[#111827] min-h-screen flex text-white">
        <Sidebar role="ds" />
        <main className="flex-1 ml-64 p-6 flex justify-center items-center">
          <Spinner size={20} text="Loading dashboard..." />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#111827] via-[#1F2937] to-[#111827] min-h-screen text-white flex relative">
      <Sidebar role="ds" />

      <main className="flex-1 p-8 md:ml-64">
        {/* Banner */}
        <div className="relative w-full mb-6 rounded-xl overflow-hidden shadow-lg">
          <img
            src="/assets/images/dashboard_banner.png"
            alt="Dashboard Banner"
            className="w-full h-40 object-cover"
          />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4 mb-6">
          <UserProfileMenu />
          <div>
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <p className="text-gray-400">{area.division}, {area.district}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard title="Pending Causes" value={stats.pending} icon={<FaHourglassHalf />} color="yellow" />
          <StatCard title="Approved Causes" value={stats.approved} icon={<FaCheckCircle />} color="green" />
          <StatCard title="Rejected Causes" value={stats.rejected} icon={<FaTimesCircle />} color="red" />
        </div>

        {/* Monthly Analytics Chart */}
        <div className="bg-[#1F2937] p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-primary mb-4">Monthly DS Verification Stats</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyAnalytics}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pending" fill="#FBBF24" />
              <Bar dataKey="approved" fill="#10B981" />
              <Bar dataKey="rejected" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Received Causes Section */}
        <div className="bg-[#1F2937] p-6 rounded-xl shadow mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">Received Causes</h2>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-3 py-1 rounded text-sm transition ${
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

          {causesLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner size={16} text="Loading causes..." />
            </div>
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
                    Amount: LKR {cause.requiredAmount.toLocaleString()} | Area: {cause.areaName}
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

// Stats card component
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    yellow: "bg-yellow-600",
    green: "bg-green-600",
    red: "bg-red-600",
  };
  return (
    <div
      className={`${colors[color] || "bg-blue-600"} p-5 rounded-xl flex items-center gap-4 shadow hover:shadow-lg transition`}
    >
      <div className="text-3xl text-white">{icon}</div>
      <div>
        <p className="text-gray-200">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
};

export default DSDashboard;
