import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";
import { toast } from "react-hot-toast";

// Skeleton Loader Component
const CauseCardSkeleton = () => (
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

const BrowseCauses = () => {
  const navigate = useNavigate();
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const categories = useMemo(() => ["All", "Health", "Education", "Disaster", "Poverty", "Environment", "Other"], []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchCauses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (category !== "All") params.append("category", category);

      const res = await axios.get(`http://localhost:5000/api/donor/causes?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCauses(res.data);
    } catch (err) {
      console.error("Failed to load causes:", err);
      setError("Failed to load causes. Please try again.");
      toast.error("Failed to load causes");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category]);

  useEffect(() => {
    fetchCauses();
  }, [fetchCauses]);

  const viewCauseDetails = useCallback((causeId) => {
    navigate(`/donor/cause-details/${causeId}`);
  }, [navigate]);

  const handleRetry = () => {
    fetchCauses();
  };

  const filteredCauses = useMemo(() => {
    return causes.filter(cause => {
      const matchesSearch = !debouncedSearch ||
        cause.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        cause.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = category === "All" || cause.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [causes, debouncedSearch, category]);

  return (
    <div className="bg-[#111827] min-h-screen flex text-white">
      <Sidebar role="donor" />

      <main className="flex-1 ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#26bfef]">Browse Causes</h1>
          <button
            onClick={() => navigate("/donor/dashboard")}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-[#1F2937] p-6 rounded-xl mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Search Causes
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title..."
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#26bfef]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#26bfef]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Causes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CauseCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-400 mb-2">Failed to load causes</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-[#26bfef] hover:bg-[#0a6c8b] text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredCauses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">No causes found</h2>
            <p className="text-gray-400 mb-4">
              {debouncedSearch || category !== "All"
                ? "Try adjusting your search terms or category filter."
                : "There are no active causes at the moment. Check back later!"}
            </p>
            {(debouncedSearch || category !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCauses.map((cause) => (
              <div
                key={cause._id}
                className="bg-[#1F2937] rounded-xl overflow-hidden shadow-lg hover:shadow-[#26bfef]/20 transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => viewCauseDetails(cause._id)}
              >
                {/* Cause Image */}
                <div className="h-48 bg-gray-700 relative overflow-hidden">
                  <img
                    src={`http://localhost:5000${cause.image}`}
                    alt={cause.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/assets/images/default.jpg";
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-[#26bfef] text-xs font-semibold rounded-full">
                      {cause.category}
                    </span>
                  </div>
                  {cause.isCompleted && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎉</div>
                        <div className="text-white font-semibold">FUNDED</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cause Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#26bfef] mb-2 line-clamp-2">
                    {cause.title}
                  </h3>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {cause.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Raised</span>
                      <span className="text-[#26bfef]">
                        LKR {cause.fundsRaised?.toLocaleString() || 0} / LKR {cause.requiredAmount?.toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#26bfef] h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((cause.fundsRaised / cause.requiredAmount) * 100, 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{Math.min((cause.fundsRaised / cause.requiredAmount) * 100, 100).toFixed(1)}% funded</span>
                      <span>{cause.donorsCount || 0} donors</span>
                    </div>
                  </div>

                  {/* Beneficiary & Location */}
                  <div className="text-sm text-gray-400 mb-4">
                    <p><strong>Beneficiary:</strong> {cause.beneficiaryName}</p>
                    <p><strong>Location:</strong> {cause.areaName}, {cause.divisionName}</p>
                  </div>

                  {/* Donate Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      viewCauseDetails(cause._id);
                    }}
                    className="w-full bg-[#26bfef] hover:bg-[#0a6c8b] text-white py-2 px-4 rounded-lg transition-colors font-medium"
                  >
                    View Details & Donate
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

export default BrowseCauses;