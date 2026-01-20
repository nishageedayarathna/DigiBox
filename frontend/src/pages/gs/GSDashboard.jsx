// GSDashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { fetchGSDashboard } from "../../services/gsService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const GSDashboard = () => {
  const [stats, setStats] = useState(null);
  const [area, setArea] = useState(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGSDashboard()
      .then((res) => {
        const data = res.data;

        setStats({
          pending: data.pendingCauses,
          approved: data.approvedCauses,
          rejected: data.rejectedCauses,
        });

        setArea({
          district: data.welcomeInfo.gsOfficer.district,
          division: data.welcomeInfo.gsOfficer.division,
          gnArea: data.welcomeInfo.gsOfficer.area,
        });

        setMonthlyAnalytics(data.monthlyAnalytics || []);
        setUser({
          username: data.welcomeInfo.gsOfficer.username,
          email: data.welcomeInfo.gsOfficer.email,
          profileImage: data.welcomeInfo.gsOfficer.profileImage || "/images/default-profile.png",
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-white p-8">Loading...</p>;

  return (
    <div className="bg-gradient-to-r from-[#111827] via-[#1F2937] to-[#111827] min-h-screen text-white flex relative">
      <Sidebar role="gs" />

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
  <img
    src="/assets/images/user.webp" // <-- your new profile image here
    alt="GS Officer Profile"
    className="w-16 h-16 rounded-full border-2 border-[#26bfef]"
  />
  <div>
    <h2 className="text-xl font-bold text-white">{user.username}</h2>
    <p className="text-gray-400">{area.gnArea}, {area.division}, {area.district}</p>
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
          <h2 className="text-lg font-semibold text-[#26bfef] mb-4">Monthly Verification Stats</h2>
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
    <div className={`${colors[color] || "bg-blue-600"} p-5 rounded-xl flex items-center gap-4 shadow hover:shadow-lg transition`}>
      <div className="text-3xl text-white">{icon}</div>
      <div>
        <p className="text-gray-200">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  );
};

export default GSDashboard;
