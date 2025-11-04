import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../components/dashboard/Sidebar";
import StatsCard from "../../components/dashboard/StatCard";
import AnalyticsChart from "../../components/dashboard/BarChartView";
import RecentList from "../../components/dashboard/RecentList";
import QuickActions from "../../components/dashboard/QuickActions";

const CreatorDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const chartData = [
    { month: "Jan", causes: 2 },
    { month: "Feb", causes: 3 },
    { month: "Mar", causes: 1 },
    { month: "Apr", causes: 4 },
  ];

  const stats = [
    { title: "Total Causes Created", value: 12 },
    { title: "Approved Causes", value: 7 },
    { title: "Pending Causes", value: 3 },
    { title: "Rejected Causes", value: 2 },
    { title: "Total Funds Raised", value: "LKR 54,000" },
  ];

  const recentCauses = [
    { title: "Help School Renovation", status: "Approved", date: "2025-10-25" },
    { title: "Medical Support", status: "Pending", date: "2025-10-28" },
  ];

  const handleBack = () => setActiveView("dashboard");

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="creator" />

      <main className="flex-1 p-8 md:ml-64 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-[#26bfef] mb-6">Creator Dashboard</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                {stats.map((s, i) => (
                  <StatsCard key={i} title={s.title} value={s.value} />
                ))}
              </div>

              <div className="bg-[#1F2937] p-6 rounded-2xl shadow-lg mb-10">
                <h2 className="text-xl font-semibold mb-4 text-[#26bfef]">Monthly Causes Created</h2>
                <AnalyticsChart data={chartData} showLabels />
              </div>

              <RecentList
                title="Recent Causes Created"
                data={recentCauses}
                titleKey="title"
                statusKey="status"
                dateKey="date"
              />

              <QuickActions role="creator" onViewChange={setActiveView} />
            </motion.div>
          )}

          {activeView === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-[#26bfef]">Analytics Overview</h1>
                <button
                  onClick={handleBack}
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
