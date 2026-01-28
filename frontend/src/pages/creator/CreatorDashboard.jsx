import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [activeCauses, setActiveCauses] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      try {
        const [statsRes, recentRes, chartRes] = await Promise.all([
          axios.get("http://localhost:5000/api/cause/stats", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/cause/my-causes", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/cause/analytics/monthly", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setStats(statsRes.data);
        setRecentCauses(recentRes.data.slice(0, 5));
        
        // Filter active/approved causes with published status
        const activeApprovedCauses = recentRes.data.filter(
          cause => cause.finalStatus === "approved" || cause.dsStatus === "approved"
        );
        setActiveCauses(activeApprovedCauses);

        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const formatted = chartRes.data.map(d => ({ month: months[d.month - 1], causes: d.count }));
        setChartData(formatted);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false); // finished loading
      }
    };

    fetchData();
  }, []);

  // Show centered spinner while loading
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#111827]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-xl mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="creator" />
      <main className="flex-1 p-8 md:ml-64 overflow-x-hidden">
        {activeView === "dashboard" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-primary">Creator Dashboard</h1>
              <UserProfileMenu />
            </div>

            {/* Stats Section */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
                <StatsCard title="Total Causes Created" value={stats.totalCauses || 0} />
                <StatsCard title="Approved Causes" value={stats.approved || 0} />
                <StatsCard title="Pending Causes" value={stats.pending || 0} />
                <StatsCard title="Rejected Causes" value={stats.rejected || 0} />
                <StatsCard title="Total Funds Raised" value={`LKR ${stats.totalFunds || 0}`} />
              </div>
            )}

            <div className="bg-[#1F2937] p-6 rounded-2xl shadow-lg mb-10">
              <h2 className="text-xl font-semibold mb-4 text-primary">Monthly Causes Created</h2>
              <AnalyticsChart data={chartData} showLabels />
            </div>

            {/* Active Causes with Donation Progress */}
            {activeCauses.length > 0 && (
              <div className="bg-[#1F2937] p-6 rounded-2xl shadow-lg mb-10">
                <h2 className="text-xl font-semibold mb-6 text-primary">Active Causes - Donation Progress</h2>
                <div className="space-y-6">
                  {activeCauses.map((cause) => {
                    const progress = Math.min(((cause.fundsRaised || 0) / cause.requiredAmount) * 100, 100);
                    const remaining = Math.max(0, cause.requiredAmount - (cause.fundsRaised || 0));
                    
                    return (
                      <div key={cause._id} className="bg-[#111827] p-5 rounded-lg border border-gray-700 hover:border-primary transition">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1">{cause.title}</h3>
                            <p className="text-sm text-gray-400">{cause.category} • Created {new Date(cause.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            progress >= 100 ? 'bg-green-600 text-white' : 
                            progress > 0 ? 'bg-yellow-600 text-white' : 
                            'bg-gray-600 text-white'
                          }`}>
                            {progress >= 100 ? '✓ Target Achieved' : progress > 0 ? '⟳ Ongoing' : '⏳ Not Started'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Progress: {progress.toFixed(1)}%</span>
                            <span>{cause.donorsCount || 0} donors</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300 rounded-full"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Fund Details */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-[#1F2937] p-3 rounded">
                            <p className="text-xs text-gray-400 mb-1">Target</p>
                            <p className="text-sm font-semibold text-white">LKR {Number(cause.requiredAmount).toLocaleString('en-US')}</p>
                          </div>
                          <div className="bg-[#1F2937] p-3 rounded">
                            <p className="text-xs text-gray-400 mb-1">Raised</p>
                            <p className="text-sm font-semibold text-secondary">LKR {Number(cause.fundsRaised || 0).toLocaleString('en-US')}</p>
                          </div>
                          <div className="bg-[#1F2937] p-3 rounded">
                            <p className="text-xs text-gray-400 mb-1">Remaining</p>
                            <p className="text-sm font-semibold text-primary">LKR {Number(remaining).toLocaleString('en-US')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <RecentList title="Recent Causes Created" data={recentCauses} titleKey="title" statusKey="status" dateKey="createdAt" />
            <QuickActions role="creator" onViewChange={setActiveView} />
          </div>
        )}

        {activeView === "analytics" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-primary">Analytics Overview</h1>
              <button onClick={() => setActiveView("dashboard")} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition">← Back to Dashboard</button>
            </div>
            <div className="bg-[#1F2937] p-8 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold mb-5 text-primary">Monthly Cause Statistics</h2>
              <AnalyticsChart data={chartData} showLabels />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreatorDashboard;
