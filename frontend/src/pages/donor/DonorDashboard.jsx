import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import StatCard from "../../components/dashboard/StatCard";
import axios from "axios";
import { toast } from "react-hot-toast";

// Skeleton Loader Component
const SkeletonLoader = ({ className }) => (
  <div className={`animate-pulse bg-gray-700 rounded ${className}`}></div>
);

const DonorDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:5000/api/donor/summary", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleRetry = () => {
    fetchSummary();
  };

  if (loading) {
    return (
      <div className="bg-[#111827] min-h-screen flex text-white">
        <Sidebar role="donor" />
        <main className="flex-1 ml-64 p-6">
          {/* Welcome Skeleton */}
          <SkeletonLoader className="h-8 w-64 mb-2" />
          <SkeletonLoader className="h-4 w-96 mb-6" />

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1F2937] p-6 rounded-xl">
                <SkeletonLoader className="h-4 w-24 mb-2" />
                <SkeletonLoader className="h-8 w-20" />
              </div>
            ))}
          </div>

          {/* Progress Bar Skeleton */}
          <div className="bg-[#1F2937] p-6 rounded-xl mb-6">
            <SkeletonLoader className="h-4 w-48 mb-3" />
            <SkeletonLoader className="h-4 w-full mb-2" />
            <SkeletonLoader className="h-3 w-24" />
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-[#1F2937] p-6 rounded-xl">
            <SkeletonLoader className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonLoader key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#111827] min-h-screen flex text-white">
        <Sidebar role="donor" />
        <main className="flex-1 ml-64 p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-[#26bfef] hover:bg-[#0a6c8b] text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!data) return null;

  const progress = data.progressTarget > 0
    ? Math.min((data.totalDonated / data.progressTarget) * 100, 100)
    : 100;

  return (
    <div className="bg-[#111827] min-h-screen flex text-white">
      <Sidebar role="donor" />

      <main className="flex-1 ml-64 p-6">
        {/* Welcome */}
        <h1 className="text-2xl font-bold text-[#26bfef] mb-2">
          Welcome back, {data.username} 👋
        </h1>
        <p className="text-gray-400 mb-6">
          Thank you for making a difference in our community.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Donated"
            value={`LKR ${data.totalDonated.toLocaleString()}`}
            color="text-green-400"
          />
          <StatCard
            title="Current Badge"
            value={data.badge}
            color="text-yellow-400"
          />
          <StatCard
            title="Causes Supported"
            value={data.totalCausesSupported}
            color="text-blue-400"
          />
          <StatCard
            title="Total Donations"
            value={data.totalDonations}
            color="text-purple-400"
          />
        </div>

        {/* Progress Bar */}
        <div className="bg-[#1F2937] p-6 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-400">
              Progress to next badge
            </p>
            <p className="text-sm text-[#26bfef]">
              LKR {data.totalDonated.toLocaleString()} / LKR {data.progressTarget.toLocaleString()}
            </p>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4">
            <div
              className="bg-[#26bfef] h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {progress.toFixed(1)}% complete
          </p>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1F2937] p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-[#26bfef] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/donor/browse-causes")}
              className="bg-[#26bfef] hover:bg-[#0a6c8b] text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse Causes
            </button>
            <button
              onClick={() => navigate("/donor/completed-causes")}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              View Success Stories
            </button>
            <button
              onClick={() => navigate("/donor/donation-history")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Donation History
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorDashboard;