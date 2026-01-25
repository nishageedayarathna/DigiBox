import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";
import { toast } from "react-hot-toast";

// Category to image mapping
const getCategoryImage = (category) => {
  const categoryImages = {
    Health: "/assets/images/health.jpg",
    Education: "/assets/images/education.jpg",
    Disaster: "/assets/images/disaster.jpg",
    Poverty: "/assets/images/poverty.jpg",
    Environment: "/assets/images/environment.jpg",
    Other: "/assets/images/default.jpg"
  };
  return categoryImages[category] || categoryImages.Other;
};

// Skeleton Loader Component
const CauseDetailsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-700 rounded mb-6"></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-[#1F2937] p-6 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-1"></div>
              <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        </div>
        <div className="bg-[#1F2937] p-6 rounded-xl">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-700 rounded"></div>
            ))}
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="bg-[#1F2937] p-6 rounded-xl">
          <div className="h-6 bg-gray-700 rounded mb-6"></div>
          <div className="space-y-6">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CauseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cause, setCause] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donating, setDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [showThankYou, setShowThankYou] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const fetchCauseDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`http://localhost:5000/api/donor/causes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCause(res.data);
    } catch (err) {
      console.error("Failed to load cause details:", err);
      setError("Failed to load cause details. Please try again.");
      toast.error("Failed to load cause details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCauseDetails();
  }, [fetchCauseDetails]);

  const handleRetry = () => {
    fetchCauseDetails();
  };

  const progressPercentage = useMemo(() => {
    if (!cause) return 0;
    return Math.min((cause.fundsRaised / cause.requiredAmount) * 100, 100);
  }, [cause]);

  const remainingAmount = useMemo(() => {
    if (!cause) return 0;
    return cause.requiredAmount - cause.fundsRaised;
  }, [cause]);

  const handleDonate = async () => {
    if (!donationAmount || donationAmount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    if (donationAmount < 100) {
      toast.error("Minimum donation amount is LKR 100");
      return;
    }

    try {
      setDonating(true);
      const res = await axios.post(
        `http://localhost:5000/api/donor/donate/${id}`,
        {
          amount: parseFloat(donationAmount),
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setReceipt(res.data.receipt);
      setShowThankYou(true);
      toast.success("Donation successful! A confirmation email has been sent to your inbox.");

      // Refresh cause data to show updated progress
      fetchCauseDetails();
    } catch (err) {
      console.error("Donation failed:", err);
      toast.error(err.response?.data?.message || "Donation failed");
    } finally {
      setDonating(false);
    }
  };

  const closeThankYou = () => {
    setShowThankYou(false);
    setReceipt(null);
    setDonationAmount("");
  };

  if (loading) {
    return (
      <div className="bg-[#111827] min-h-screen flex text-white">
        <Sidebar role="donor" />
        <main className="flex-1 ml-64 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-[#26bfef]">Cause Details</h1>
            <button
              onClick={() => navigate("/donor/browse-causes")}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              ← Back to Browse
            </button>
          </div>
          <CauseDetailsSkeleton />
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
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="bg-[#26bfef] hover:bg-[#0a6c8b] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/donor/browse-causes")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Back to Browse
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!cause) {
    return (
      <div className="bg-[#111827] min-h-screen flex text-white">
        <Sidebar role="donor" />
        <main className="flex-1 ml-64 p-6">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">Cause not found</h2>
            <p className="text-gray-400 mb-6">The cause you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate("/donor/browse-causes")}
              className="bg-[#26bfef] hover:bg-[#0a6c8b] text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse Other Causes
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] min-h-screen flex text-white">
      <Sidebar role="donor" />

      <main className="flex-1 ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#26bfef]">Cause Details</h1>
          <button
            onClick={() => navigate("/donor/browse-causes")}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back to Browse
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cause Image */}
            <div className="bg-[#1F2937] rounded-xl overflow-hidden">
              <img
                src={cause.image || getCategoryImage(cause.category)}
                alt={cause.title}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.src = "/assets/images/default.jpg";
                }}
              />
            </div>

            {/* Cause Info */}
            <div className="bg-[#1F2937] p-6 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#26bfef] mb-2">{cause.title}</h2>
                  <span className="px-3 py-1 bg-[#26bfef] text-sm font-semibold rounded-full">
                    {cause.category}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Created by</p>
                  <p className="text-sm font-semibold">{cause.creator?.username || "Anonymous"}</p>
                </div>
              </div>

              <p className="text-gray-300 mb-6">{cause.description}</p>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-lg font-semibold mb-2">
                  <span>LKR {cause.fundsRaised?.toLocaleString() || 0} raised</span>
                  <span>LKR {cause.requiredAmount?.toLocaleString() || 0} goal</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                  <div
                    className="bg-[#26bfef] h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400">
                  {progressPercentage.toFixed(1)}% funded • {cause.donorsCount || 0} donors
                </p>
              </div>

              {/* Beneficiary Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#26bfef] mb-3">Beneficiary Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {cause.beneficiaryName}</p>
                    <p><strong>Contact:</strong> {cause.beneficiaryContact}</p>
                    <p><strong>Bank:</strong> {cause.beneficiaryBank}</p>
                    <p><strong>Account:</strong> {cause.beneficiaryAccountName}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#26bfef] mb-3">Location</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Area:</strong> {cause.areaName}</p>
                    <p><strong>Division:</strong> {cause.divisionName}</p>
                    <p><strong>District:</strong> {cause.districtName}</p>
                  </div>
                </div>
              </div>

              {/* Evidence */}
              {cause.evidenceFile && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-[#26bfef] mb-3">Supporting Evidence</h3>
                  <a
                    href={`http://localhost:5000${cause.evidenceFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    View Evidence Document
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Donation Sidebar */}
          <div className="space-y-6">
            {/* Donation Form */}
            {!cause.isCompleted && (
              <div className="bg-[#1F2937] p-6 rounded-xl">
                <h3 className="text-xl font-bold text-[#26bfef] mb-4">Make a Donation</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Donation Amount (LKR)
                    </label>
                    <input
                      type="number"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      placeholder="Enter amount"
                      min="100"
                      className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#26bfef]"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum donation: LKR 100</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#26bfef]"
                    >
                      <option value="Card">Credit/Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <button
                    onClick={handleDonate}
                    disabled={donating}
                    className="w-full bg-[#26bfef] hover:bg-[#0a6c8b] disabled:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-semibold"
                  >
                    {donating ? "Processing..." : "Donate Now"}
                  </button>
                </div>
              </div>
            )}

            {/* Completion Status */}
            {cause.isCompleted && (
              <div className="bg-green-800/20 border border-green-600 p-6 rounded-xl">
                <div className="text-center">
                  <div className="text-6xl mb-2">🎉</div>
                  <h3 className="text-xl font-bold text-green-400 mb-2">Goal Achieved!</h3>
                  <p className="text-green-300">
                    This cause has reached its funding goal. Thank you for your support!
                  </p>
                </div>
              </div>
            )}

            {/* Impact Stats */}
            <div className="bg-[#1F2937] p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-[#26bfef] mb-4">Impact</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Funds Raised:</span>
                  <span className="font-semibold">LKR {cause.fundsRaised?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Donors:</span>
                  <span className="font-semibold">{cause.donorsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Progress:</span>
                  <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Modal */}
        {showThankYou && receipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1F2937] p-8 rounded-xl max-w-md w-full mx-4">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-[#26bfef] mb-2">Thank You!</h2>
                <p className="text-gray-300">Your donation has been processed successfully.</p>
                <p className="text-sm text-gray-400 mt-2">📧 A confirmation email has been sent to your inbox.</p>
              </div>

              <div className="bg-[#111827] p-4 rounded-lg mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction ID:</span>
                    <span className="font-mono">{receipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cause:</span>
                    <span>{receipt.causeTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-semibold text-[#26bfef]">LKR {receipt.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span>{new Date(receipt.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeThankYou}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate("/donor/donation-history")}
                  className="flex-1 bg-[#26bfef] hover:bg-[#0a6c8b] text-white py-2 px-4 rounded-lg transition-colors"
                >
                  View History
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CauseDetails;