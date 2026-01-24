import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";
import { toast } from "react-hot-toast";

// Skeleton Loader Component
const CompletedCauseSkeleton = () => (
  <div className="bg-[#1F2937] p-6 rounded-xl animate-pulse">
    <div className="flex items-start space-x-4">
      <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
      <div className="flex-1">
        <div className="h-6 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded mb-1"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-700 rounded"></div>
      <div className="h-4 bg-gray-700 rounded w-2/3"></div>
    </div>
    <div className="mt-4 h-10 bg-gray-700 rounded-lg"></div>
  </div>
);

const CompletedCauses = () => {
  const navigate = useNavigate();
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompletedCauses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:5000/api/donor/causes/completed", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCauses(res.data);
    } catch (err) {
      console.error("Failed to load completed causes:", err);
      setError("Failed to load completed causes. Please try again.");
      toast.error("Failed to load completed causes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedCauses();
  }, [fetchCompletedCauses]);

  const handleRetry = () => {
    fetchCompletedCauses();
  };

  const viewCauseDetails = useCallback((causeId) => {
    navigate(`/donor/cause-details/${causeId}`);
  }, [navigate]);

  const totalImpact = useMemo(() => {
    return causes.reduce((sum, cause) => sum + (cause.fundsRaised || 0), 0);
  }, [causes]);

  const totalBeneficiaries = useMemo(() => {
    return causes.reduce((sum, cause) => sum + (cause.donorsCount || 0), 0);
  }, [causes]);

  return (
    <div className="bg-[#111827] min-h-screen flex text-white">
      <Sidebar role="donor" />

      <main className="flex-1 ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#26bfef]">Completed Causes</h1>
          <button
            onClick={() => navigate("/donor/browse-causes")}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back to Active Causes
          </button>
        </div>

        {/* Summary */}
        <div className="bg-[#1F2937] p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold text-[#26bfef] mb-4">Impact Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{causes.length}</p>
              <p className="text-gray-400">Causes Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">
                LKR {totalImpact.toLocaleString()}
              </p>
              <p className="text-gray-400">Total Funds Raised</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-400">
                {totalBeneficiaries}
              </p>
              <p className="text-gray-400">Lives Impacted</p>
            </div>
          </div>
        </div>

        {/* Causes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CompletedCauseSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-400 mb-2">Failed to load completed causes</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-[#26bfef] hover:bg-[#0a6c8b] text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : causes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No completed causes yet</h2>
            <p className="text-gray-400 mb-6">
              There are no successfully funded causes at the moment. Help make a difference by supporting active causes!
            </p>
            <button
              onClick={() => navigate("/donor/browse-causes")}
              className="bg-[#26bfef] hover:bg-[#0a6c8b] text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse Active Causes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {causes.map((cause) => (
              <div
                key={cause._id}
                className="bg-[#1F2937] rounded-xl overflow-hidden shadow-lg hover:shadow-[#26bfef]/20 transition-shadow cursor-pointer"
                onClick={() => viewCauseDetails(cause._id)}
              >
                {/* Cause Image */}
                <div className="h-48 bg-gray-700 relative">
                  <img
                    src={`http://localhost:5000${cause.image}`}
                    alt={cause.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/assets/images/default.jpg";
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-green-600 text-xs font-semibold rounded-full">
                      COMPLETED
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-[#26bfef] text-xs font-semibold rounded-full">
                      {cause.category}
                    </span>
                  </div>
                </div>

                {/* Cause Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#26bfef] mb-2 line-clamp-2">
                    {cause.title}
                  </h3>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {cause.description}
                  </p>

                  {/* Progress Bar - Always 100% */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Raised</span>
                      <span className="text-green-400 font-semibold">
                        LKR {cause.fundsRaised?.toLocaleString() || 0} / LKR {cause.requiredAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <p className="text-xs text-green-400 mt-1">
                      100% funded • {cause.donorsCount || 0} donors
                    </p>
                  </div>

                  {/* Beneficiary & Location */}
                  <div className="text-sm text-gray-400 mb-4">
                    <p><strong>Beneficiary:</strong> {cause.beneficiaryName}</p>
                    <p><strong>Location:</strong> {cause.areaName}, {cause.divisionName}</p>
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewCauseDetails(cause._id);
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    View Success Story
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CompletedCauses;
