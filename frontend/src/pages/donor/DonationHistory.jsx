import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";
import { toast } from "react-hot-toast";

// Skeleton Loader Component
const DonationHistorySkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-[#1F2937] p-6 rounded-xl">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-5 bg-gray-700 rounded mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="text-right">
            <div className="h-6 bg-gray-700 rounded mb-1"></div>
            <div className="h-4 bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const DonationHistory = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, thisMonth, thisYear
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDonationHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get("http://localhost:5000/api/donor/history", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setDonations(res.data);
    } catch (err) {
      console.error("Failed to load donation history:", err);
      setError("Failed to load donation history. Please try again.");
      toast.error("Failed to load donation history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonationHistory();
  }, [fetchDonationHistory]);

  const handleRetry = () => {
    fetchDonationHistory();
  };

  const filteredDonations = useMemo(() => {
    return donations.filter((donation) => {
      const donationDate = new Date(donation.createdAt);
      const now = new Date();

      // Date filter
      let dateMatch = true;
      switch (filter) {
        case "thisMonth":
          dateMatch = (
            donationDate.getMonth() === now.getMonth() &&
            donationDate.getFullYear() === now.getFullYear()
          );
          break;
        case "thisYear":
          dateMatch = donationDate.getFullYear() === now.getFullYear();
          break;
        default:
          dateMatch = true;
      }

      // Search filter
      const searchMatch = !searchTerm ||
        donation.causeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

      return dateMatch && searchMatch;
    });
  }, [donations, filter, searchTerm]);

  const totalDonated = useMemo(() => {
    return filteredDonations.reduce((sum, d) => sum + d.amount, 0);
  }, [filteredDonations]);

  const totalDonations = filteredDonations.length;

  const exportToCSV = () => {
    const csvData = filteredDonations.map(donation => ({
      'Transaction ID': donation.transactionId,
      'Cause': donation.causeTitle,
      'Amount': donation.amount,
      'Date': new Date(donation.createdAt).toLocaleDateString(),
      'Payment Method': donation.paymentMethod
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donation-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Donation history exported successfully!");
  };

  const downloadReceipt = (donation) => {
    // Create a simple receipt
    const receiptContent = `
DONATION RECEIPT
================

Transaction ID: ${donation.transactionId}
Date: ${new Date(donation.createdAt).toLocaleDateString()}
Cause: ${donation.cause.title}
Amount: LKR ${donation.amount}
Payment Method: ${donation.paymentMethod}

Thank you for your generous donation!
DigiBox Donation Platform
    `.trim();

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${donation.transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#111827] min-h-screen flex text-white">
      <Sidebar role="donor" />

      <main className="flex-1 ml-64 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Donation History</h1>
          <div className="flex gap-3">
            {filteredDonations.length > 0 && (
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                📊 Export CSV
              </button>
            )}
            <button
              onClick={() => navigate("/donor/dashboard")}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1F2937] p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-primary">Total Donated</h3>
            <p className="text-2xl font-bold">LKR {totalDonated.toLocaleString()}</p>
          </div>
          <div className="bg-[#1F2937] p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-primary">Total Donations</h3>
            <p className="text-2xl font-bold">{totalDonations}</p>
          </div>
          <div className="bg-[#1F2937] p-4 rounded-xl">
            <h3 className="text-lg font-semibold text-primary">Average Donation</h3>
            <p className="text-2xl font-bold">
              LKR {totalDonations > 0 ? (totalDonated / totalDonations).toFixed(0) : 0}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-[#1F2937] p-4 rounded-xl mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Filter by Period
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 bg-[#111827] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Time</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
          </select>
        </div>

        {/* Donations List */}
        {loading ? (
          <DonationHistorySkeleton />
        ) : filteredDonations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No donations found for the selected period.</p>
            <button
              onClick={() => navigate("/donor/browse-causes")}
              className="mt-4 bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition-colors"
            >
              Browse Causes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDonations.map((donation) => (
              <div
                key={donation._id}
                className="bg-[#1F2937] p-6 rounded-xl hover:bg-[#374151] transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary mb-1">
                      {donation.cause.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-2">
                      Transaction ID: {donation.transactionId}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span>📅 {new Date(donation.createdAt).toLocaleDateString()}</span>
                      <span>💳 {donation.paymentMethod}</span>
                      <span>🏷️ {donation.cause.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">
                      LKR {donation.amount.toLocaleString()}
                    </p>
                    <button
                      onClick={() => downloadReceipt(donation)}
                      className="mt-2 text-primary hover:text-secondary text-sm underline"
                    >
                      Download Receipt
                    </button>
                  </div>
                </div>

                {/* Cause Description Preview */}
                <p className="text-gray-300 text-sm line-clamp-2">
                  {donation.cause.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Impact Summary */}
        {filteredDonations.length > 0 && (
          <div className="mt-8 bg-[#1F2937] p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-primary mb-4">Your Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium mb-3">Donation Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(
                    filteredDonations.reduce((acc, d) => {
                      acc[d.cause.category] = (acc[d.cause.category] || 0) + d.amount;
                      return acc;
                    }, {})
                  ).map(([category, amount]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-gray-400">{category}:</span>
                      <span className="font-semibold">LKR {amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-3">Monthly Trend</h4>
                <div className="space-y-2">
                  {Object.entries(
                    filteredDonations.reduce((acc, d) => {
                      const month = new Date(d.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short'
                      });
                      acc[month] = (acc[month] || 0) + d.amount;
                      return acc;
                    }, {})
                  )
                    .sort(([a], [b]) => new Date(a) - new Date(b))
                    .slice(-6) // Last 6 months
                    .map(([month, amount]) => (
                      <div key={month} className="flex justify-between">
                        <span className="text-gray-400">{month}:</span>
                        <span className="font-semibold">LKR {amount.toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonationHistory;
