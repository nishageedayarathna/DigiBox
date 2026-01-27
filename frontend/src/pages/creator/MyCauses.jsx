import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

const MyCauses = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/cause/my-causes", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        setCauses(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCauses();
  }, []);

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="creator" />

      <main className="flex-1 ml-0 md:ml-64 p-8">
        <h1 className="text-3xl font-bold text-primary mb-8">My Causes</h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : causes.length === 0 ? (
          <p className="text-gray-400">No causes created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {causes.map((cause) => (
              <div
                key={cause._id}
                className="bg-[#1F2937] p-6 rounded-xl shadow-md border border-gray-700"
              >
                <h2 className="text-xl font-semibold text-primary">
                  {cause.title}
                </h2>

                <p className="text-gray-300 mt-2">{cause.description}</p>

                <p className="mt-3 text-sm">
                  <span className="text-gray-400">Required Amount:</span>{" "}
                  <span className="font-semibold">LKR {cause.requiredAmount}</span>
                </p>

                <p className="mt-1 text-sm">
                  <span className="text-gray-400">Status:</span>{" "}
                  <span
                    className={`font-bold ${cause.status === "approved"
                        ? "text-green-400"
                        : cause.displayStatus.includes("pending")
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                  >
                    {cause.displayStatus}
                  </span>
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Created At: {new Date(cause.createdAt).toLocaleDateString()}
                </p>

                {/* Fund Collection Status */}
                {cause.status === "approved" && (
                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <p className="text-sm font-semibold text-gray-300 mb-2">💰 Fund Collection Status</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs font-semibold text-secondary">
                          {Math.round(((cause.fundsRaised || 0) / cause.requiredAmount) * 100)}%
                        </span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-300"
                          style={{
                            width: `${Math.min(((cause.fundsRaised || 0) / cause.requiredAmount) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs mt-3">
                        <div className="bg-[#374151] p-2 rounded">
                          <p className="text-gray-400">Target</p>
                          <p className="font-semibold text-white">
                            LKR {cause.requiredAmount}
                          </p>
                        </div>
                        <div className="bg-[#374151] p-2 rounded">
                          <p className="text-gray-400">Raised</p>
                          <p className="font-semibold text-secondary">
                            LKR {cause.fundsRaised || 0}
                          </p>
                        </div>
                        <div className="bg-[#374151] p-2 rounded">
                          <p className="text-gray-400">Remaining</p>
                          <p className="font-semibold text-primary">
                            LKR {Math.max(0, cause.requiredAmount - (cause.fundsRaised || 0))}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 text-xs">
                        <p className="text-gray-400">
                          <span className="font-semibold">{cause.donorsCount || 0}</span> donors contributed
                        </p>
                        <p className={`text-xs font-semibold mt-1 ${
                          (cause.fundsRaised || 0) >= cause.requiredAmount
                            ? "text-green-400"
                            : (cause.fundsRaised || 0) > 0
                            ? "text-yellow-400"
                            : "text-gray-400"
                        }`}>
                          {(cause.fundsRaised || 0) >= cause.requiredAmount
                            ? "✓ Target Achieved"
                            : (cause.fundsRaised || 0) > 0
                            ? "⟳ Ongoing"
                            : "⏳ Not Started"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Evidence File link */}
                <a
                  href={`http://localhost:5000${cause.evidenceFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary mt-3 inline-block underline hover:text-secondary"
                >
                  View Evidence
                </a>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCauses;
