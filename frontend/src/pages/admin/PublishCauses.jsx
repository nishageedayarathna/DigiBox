// pages/admin/PublishCauses.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";
import { toast } from "react-hot-toast";

const PublishCauses = () => {
  const [causes, setCauses] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchApprovedCauses();
  }, []);

  const fetchApprovedCauses = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/approved-causes",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCauses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load causes");
    }
  };

  const publishCause = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/publish/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Cause published successfully");
      fetchApprovedCauses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Publish failed");
    }
  };

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="admin" />

      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-2xl font-bold text-[#26bfef] mb-6">
          Publication of Causes
        </h1>

        {causes.length === 0 ? (
          <p className="text-gray-400">No causes ready for publication.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {causes.map((c) => {
              const canPublish =
                c.gsStatus === "approved" && c.dsStatus === "approved";

              return (
                <div
                  key={c._id}
                  className="bg-[#1F2937] rounded-xl shadow-lg p-6 flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold text-[#26bfef] mb-2">
                      {c.title}
                    </h2>

                    <p className="text-gray-300 mb-2">{c.description}</p>

                    <p className="text-gray-400 text-sm mb-1">
                      <strong>Beneficiary:</strong> {c.beneficiaryName}
                    </p>
                    <p className="text-gray-400 text-sm mb-1">
                      <strong>Amount:</strong> LKR {c.requiredAmount}
                    </p>

                    {/* ✅ STATUS POINTS */}
                    <ul className="mt-3 text-sm space-y-1">
                      <li
                        className={`${
                          c.gsStatus === "approved"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        ● GS Status: {c.gsStatus}
                      </li>
                      <li
                        className={`${
                          c.dsStatus === "approved"
                            ? "text-green-400"
                            : "text-yellow-400"
                        }`}
                      >
                        ● DS Status: {c.dsStatus}
                      </li>
                    </ul>
                  </div>

                  {/* ✅ PUBLISH BUTTON */}
                  <button
                    onClick={() => publishCause(c._id)}
                    disabled={!canPublish}
                    className={`mt-4 w-full py-2 rounded transition font-semibold ${
                      canPublish
                        ? "bg-green-600 hover:bg-green-500"
                        : "bg-gray-600 cursor-not-allowed"
                    }`}
                  >
                    {canPublish
                      ? "Publish to Donor Dashboard"
                      : "Waiting for Approval"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default PublishCauses;
