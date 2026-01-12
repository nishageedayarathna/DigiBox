import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

const ApproveCauses = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
  const adminAction = async (id, action) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/causes/${id}/admin-action`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCauses(); // refresh list
      alert(action === "approve" ? "Cause approved & sent to GS!" : "Cause rejected!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error performing action");
    }
  };

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="admin" />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-2xl mb-6">Admin Cause Approval</h1>

        {loading && <p>Loading causes...</p>}
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
              {/* Two buttons only */}
              <button
                onClick={() => adminAction(c._id, "approve")}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition"
              >
                Approve & Send to GS
              </button>
              <button
                onClick={() => adminAction(c._id, "reject")}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ApproveCauses;
