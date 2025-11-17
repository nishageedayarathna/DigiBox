import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

const RejectedCauses = () => {
  const [causes, setCauses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRejectedCauses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/rejected-causes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCauses(res.data.causes || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Error loading rejected causes");
    }
  };

  useEffect(() => {
    fetchRejectedCauses();
  }, []);

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="admin" />

      {/* Main Content */}
      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-3xl font-bold text-[#26bfef] mb-8">Rejected Causes</h1>

        {/* Loading */}
        {loading ? (
          <p className="text-gray-400">Loading rejected causes...</p>
        ) : causes.length === 0 ? (
          <p className="text-gray-400">No rejected causes found.</p>
        ) : (
          <div className="bg-[#1F2937] p-6 rounded-2xl shadow-xl overflow-x-auto">
            <table className="w-full table-auto text-left">
              <thead>
                <tr className="text-[#26bfef] border-b border-gray-700">
                  <th className="p-3">Cause Title</th>
                  <th className="p-3">Creator</th>
                  <th className="p-3">Required Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Evidence</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {causes.map((cause) => (
                  <tr
                    key={cause._id}
                    className="border-b border-gray-700 hover:bg-[#0a6c8b]/20 transition"
                  >
                    <td className="p-3">{cause.title}</td>

                    <td className="p-3">
                      <p className="font-semibold">{cause.creator?.username}</p>
                      <p className="text-gray-400 text-sm">{cause.creator?.email}</p>
                    </td>

                    <td className="p-3">
                      LKR{" "}
                      {cause.requiredAmount?.toLocaleString("en-US") ?? "0"}
                    </td>

                    <td className="p-3 text-red-400 font-semibold capitalize">
                      {cause.status}
                    </td>

                    <td className="p-3">
                      <a
                        href={`http://localhost:5000/api/cause/file/${cause.evidenceFile?.split("/").pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#26bfef] hover:underline"
                      >
                        View Evidence
                      </a>
                    </td>

                    <td className="p-3">
                      {new Date(cause.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default RejectedCauses;
