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
const DonateSkeleton = () => (
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

const Donate = () => {
  const { causeId } = useParams();
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
      const res = await axios.get(`http://localhost:5000/api/donor/causes/${causeId}`, {
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
  }, [causeId]);

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

  const handleDonate = async (e) => {
    e.preventDefault();

    if (!donationAmount || donationAmount <= 0) {
      toast.error("Please enter a valid donation amount");
      return;
    }

    if (donationAmount < 100) {
      toast.error("Minimum donation amount is LKR 100");
      return;
    }

    if (cause && donationAmount > (cause.requiredAmount - cause.fundsRaised)) {
      toast.error(`Maximum donation amount for this cause is LKR ${(cause.requiredAmount - cause.fundsRaised).toLocaleString()}`);
      return;
    }

    try {
      setDonating(true);
      const res = await axios.post(
        `http://localhost:5000/api/donor/donate/${causeId}`,
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

      // Refresh cause data
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
    navigate("/donor/donation-history");
  };

  if (loading) {
    return (
      <div className="bg-[#111827] min-h-screen flex text-white">
        <Sidebar role="donor" />
        <main className="flex-1 ml-64 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-primary">Make a Donation</h1>
            <button
              onClick={() => navigate("/donor/browse-causes")}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              ← Back to Browse
            </button>
          </div>
          <DonateSkeleton />
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
                className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg transition-colors"
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
              className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg transition-colors"
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
          <h1 className="text-3xl font-bold text-primary">Make a Donation</h1>
          <button
            onClick={() => navigate("/donor/browse-causes")}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            ← Back to Browse
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cause Summary */}
          <div className="space-y-6">
            {/* Cause Card */}
            <div className="bg-[#1F2937] p-6 rounded-xl">
              <div className="flex items-start space-x-4">
                <img
                  src={cause.image || getCategoryImage(cause.category)}
                  alt={cause.title}
                  className="w-20 h-20 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "/assets/images/default.jpg";
                  }}
                />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-primary mb-2">{cause.title}</h2>
                  <p className="text-gray-300 text-sm mb-3 line-clamp-3">{cause.description}</p>
                  <span className="px-3 py-1 bg-primary text-sm font-semibold rounded-full">
                    {cause.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="bg-[#1F2937] p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-primary mb-4">Funding Progress</h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Raised</span>
                  <span className="font-semibold">LKR {cause.fundsRaised?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Goal</span>
                  <span className="font-semibold">LKR {cause.requiredAmount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Remaining</span>
                  <span className="font-semibold">LKR {remainingAmount.toLocaleString()}</span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-primary h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 text-center">
                  {progressPercentage.toFixed(1)}% funded • {cause.donorsCount || 0} donors
                </p>
              </div>
            </div>

            {/* Beneficiary Info */}
            <div className="bg-[#1F2937] p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-primary mb-4">Beneficiary Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span>{cause.beneficiaryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Contact:</span>
                  <span>{cause.beneficiaryContact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span>{cause.areaName}, {cause.divisionName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="space-y-6">
            <div className="bg-[#1F2937] p-6 rounded-xl">
              <h3 className="text-xl font-bold text-primary mb-6">Complete Your Donation</h3>

              {cause.isCompleted ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <h4 className="text-lg font-semibold text-green-400 mb-2">Funding Goal Achieved!</h4>
                  <p className="text-gray-300">
                    This cause has already reached its funding goal. Thank you for your interest!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDonate} className="space-y-6">
                  {/* Amount Input */}
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
                      max={remainingAmount}
                      className="w-full p-4 bg-[#111827] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary text-lg"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Minimum: LKR 100 • Maximum: LKR {remainingAmount.toLocaleString()}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 p-4 bg-[#111827] border border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="radio"
                          value="Card"
                          checked={paymentMethod === "Card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-medium">Credit/Debit Card</div>
                          <div className="text-sm text-gray-400">Visa, MasterCard, American Express</div>
                        </div>
                      </label>

                      <label className="flex items-center space-x-3 p-4 bg-[#111827] border border-gray-600 rounded-lg cursor-pointer hover:border-primary transition-colors">
                        <input
                          type="radio"
                          value="Bank Transfer"
                          checked={paymentMethod === "Bank Transfer"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <div>
                          <div className="font-medium">Bank Transfer</div>
                          <div className="text-sm text-gray-400">Direct bank transfer</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Donate Button */}
                  <button
                    type="submit"
                    disabled={donating}
                    className="w-full bg-primary hover:bg-secondary disabled:bg-gray-600 text-white py-4 px-6 rounded-lg transition-colors font-semibold text-lg disabled:cursor-not-allowed"
                  >
                    {donating ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Donate LKR ${donationAmount || 0}`
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-blue-900/20 border border-blue-600 p-4 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="text-blue-400 text-xl">🔒</div>
                <div>
                  <h4 className="font-semibold text-blue-400 mb-1">Secure Donation</h4>
                  <p className="text-sm text-blue-300">
                    Your donation is processed securely. All transactions are encrypted and your payment information is never stored.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thank You Modal */}
        {showThankYou && receipt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1F2937] p-8 rounded-xl max-w-md w-full">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-primary mb-2">Thank You!</h2>
                <p className="text-gray-300">Your donation has been processed successfully.</p>
                <p className="text-sm text-gray-400 mt-2">📧 A confirmation email has been sent to your inbox.</p>
              </div>

              <div className="bg-[#111827] p-4 rounded-lg mb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction ID:</span>
                    <span className="font-mono text-primary">{receipt.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cause:</span>
                    <span className="font-medium">{receipt.causeTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="font-semibold text-green-400">LKR {receipt.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span>{new Date(receipt.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method:</span>
                    <span>{paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeThankYou}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => navigate("/donor/donation-history")}
                  className="flex-1 bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg transition-colors"
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

export default Donate;