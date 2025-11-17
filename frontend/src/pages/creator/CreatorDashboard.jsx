import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../../components/dashboard/Sidebar";
import StatsCard from "../../components/dashboard/StatCard";
import AnalyticsChart from "../../components/dashboard/BarChartView";
import RecentList from "../../components/dashboard/RecentList";
import QuickActions from "../../components/dashboard/QuickActions";
import UserProfileMenu from "../../components/dashboard/UserProfileMenu";

const CreatorDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const [stats, setStats] = useState(null);
  const [recentCauses, setRecentCauses] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    /* ----------- FETCH STATS ----------- */
    axios
      .get("http://localhost:5000/api/cause/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error("Stats error:", err));

    /* ----------- FETCH RECENT CAUSES ----------- */
    axios
      .get("http://localhost:5000/api/cause/my-causes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRecentCauses(res.data.slice(0, 5)))
      .catch((err) => console.error("Recent causes error:", err));

    /* ----------- FETCH ANALYTICS CHART DATA ----------- */
    axios
      .get("http://localhost:5000/api/cause/analytics/monthly", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const months = [
          "Jan","Feb","Mar","Apr","May","Jun",
          "Jul","Aug","Sep","Oct","Nov","Dec"
        ];

        const formatted = res.data.map((d) => ({
          month: months[d.month - 1],
          causes: d.count,
        }));

        setChartData(formatted);
      })
      .catch((err) => console.error("Analytics error:", err));
  }, []);

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="creator" />

      <main className="flex-1 p-8 md:ml-64 overflow-x-hidden">
        <AnimatePresence mode="wait">

          {/* DASHBOARD VIEW */}
          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
            >
              
              {/* 🔵 Dashboard Header + Profile Menu */}
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#26bfef]">
                  Creator Dashboard
                </h1>
                <UserProfileMenu />
              </div>

              {/* Stats Section */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                  <StatsCard title="Total Causes Created" value={stats.totalCauses} />
                  <StatsCard title="Approved Causes" value={stats.approved} />
                  <StatsCard title="Pending Causes" value={stats.pending} />
                  <StatsCard title="Rejected Causes" value={stats.rejected} />
                  <StatsCard title="Total Funds Raised" value={`LKR ${stats.totalFunds}`} />
                </div>
              )}

              {/* Chart */}
              <div className="bg-[#1F2937] p-6 rounded-2xl shadow-lg mb-10">
                <h2 className="text-xl font-semibold mb-4 text-[#26bfef]">
                  Monthly Causes Created
                </h2>
                <AnalyticsChart data={chartData} showLabels />
              </div>

              {/* Recent Causes */}
              <RecentList
                title="Recent Causes Created"
                data={recentCauses}
                titleKey="title"
                statusKey="status"
                dateKey="createdAt"
              />

              {/* Quick Actions */}
              <QuickActions role="creator" onViewChange={setActiveView} />
            </motion.div>
          )}

          {/* ANALYTICS VIEW */}
          {activeView === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#26bfef]">
                  Analytics Overview
                </h1>

                <button
                  onClick={() => setActiveView("dashboard")}
                  className="px-4 py-2 bg-[#26bfef] text-white rounded-lg hover:bg-[#0a6c8b] transition"
                >
                  ← Back to Dashboard
                </button>
              </div>

              <div className="bg-[#1F2937] p-8 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-5 text-[#26bfef]">
                  Monthly Cause Statistics
                </h2>
                <AnalyticsChart data={chartData} showLabels />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default CreatorDashboard;
