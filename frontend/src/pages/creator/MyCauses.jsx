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
        <h1 className="text-3xl font-bold text-[#26bfef] mb-8">My Causes</h1>

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
                <h2 className="text-xl font-semibold text-[#26bfef]">
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
                        : cause.status === "pending"
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                  >
                    {cause.status}
                  </span>
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Created At: {new Date(cause.createdAt).toLocaleDateString()}
                </p>

                {/* Evidence File link */}
                <a
                  href={`http://localhost:5000${cause.evidenceFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#26bfef] mt-3 inline-block underline hover:text-[#0a6c8b]"
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
