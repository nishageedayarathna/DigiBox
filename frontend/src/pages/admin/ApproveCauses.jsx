import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";
import AlertModal from "../../components/AlertModal";
import LoadingSpinner from "../../components/LoadingSpinner";

const ApproveCauses = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectingCause, setRejectingCause] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });
  const [actionLoading, setActionLoading] = useState(null); // Track which cause's action is loading
  const token = localStorage.getItem("token");

  // Fetch causes for admin dashboard
  const fetchCauses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/causes/admin-dashboard",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCauses(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch causes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCauses();
  }, []);

  // Admin approve & send to GS OR reject
  const adminAction = async (id, action, reason = "") => {
    setActionLoading(id);
    try {
      const payload = { action };
      if (action === "reject") {
        payload.reason = reason;
      }

      await axios.put(
        `http://localhost:5000/api/admin/causes/${id}/admin-action`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCauses(); // refresh list
      setAlert({ isOpen: true, message: action === "approve" ? "Cause approved & sent to GS!" : "Cause rejected with reason sent to creator!", type: "success" });
      setRejectingCause(null);
      setRejectionReason("");
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, message: err.response?.data?.message || "Error performing action", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (causeId) => {
    setRejectingCause(causeId);
    setRejectionReason("");
  };

  const handleRejectSubmit = (causeId) => {
    if (!rejectionReason.trim()) {
      setAlert({ isOpen: true, message: "Please provide a rejection reason", type: "warning" });
      return;
    }
    adminAction(causeId, "reject", rejectionReason.trim());
  };

  const handleRejectCancel = () => {
    setRejectingCause(null);
    setRejectionReason("");
  };

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="admin" />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-2xl mb-6">Admin Cause Approval</h1>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner text="Loading causes..." />
          </div>
        )}
        {error && <p className="text-red-400 mb-4">{error}</p>}
        {!loading && causes.length === 0 && <p>No pending causes.</p>}

        {causes.map((c) => (
          <div key={c._id} className="bg-[#1F2937] p-4 mb-4 rounded">
            <h3 className="font-bold text-lg">{c.title}</h3>
            <p>Beneficiary: {c.beneficiaryName}</p>
            <p>Required Amount: LKR {c.requiredAmount}</p>
            <p>
              District: {c.districtName}, Division: {c.divisionName}, Area: {c.areaName}
            </p>
            <p>
              Evidence:{" "}
              <a
                href={`http://localhost:5000${c.evidenceFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400"
              >
                View File
              </a>
            </p>

            <div className="mt-2 flex flex-wrap gap-2">
              {rejectingCause === c._id ? (
                // Rejection reason form
                <div className="w-full bg-red-900/20 p-4 rounded border border-red-500/30">
                  <h4 className="text-red-400 font-semibold mb-2">Rejection Reason (Required)</h4>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    className="w-full p-3 bg-[#111827] border border-red-500/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-red-400"
                    rows="3"
                    maxLength="500"
                  />
                  <div className="text-sm text-gray-400 mb-3">
                    {rejectionReason.length}/500 characters
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectSubmit(c._id)}
                      className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition text-sm font-semibold"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={handleRejectCancel}
                      className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Normal action buttons
                <>
                  <button
                    onClick={() => adminAction(c._id, "approve")}
                    disabled={actionLoading === c._id}
                    className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === c._id ? (
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Approving...
                      </span>
                    ) : (
                      "Approve & Send to GS"
                    )}
                  </button>
                  <button
                    onClick={() => handleRejectClick(c._id)}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        <AlertModal 
          message={alert.message} 
          isOpen={alert.isOpen} 
          onClose={() => setAlert({ ...alert, isOpen: false })} 
          type={alert.type}
        />
      </main>
    </div>
  );
};

export default ApproveCauses;
