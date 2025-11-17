import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

const PendingCauses = () => {
  const [pendingCauses, setPendingCauses] = useState([]);

  // Fetch pending causes
  const fetchCauses = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/pending-causes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPendingCauses(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching pending causes");
    }
  };

  useEffect(() => {
    fetchCauses();
  }, []);

  const handleApprove = async (causeId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/approve/${causeId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Cause approved!");
      fetchCauses();
    } catch (err) {
      console.error(err);
      alert("Error approving cause");
    }
  };

  const handleReject = async (causeId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/reject/${causeId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Cause rejected!");
      fetchCauses();
    } catch (err) {
      console.error(err);
      alert("Error rejecting cause");
    }
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      
    
      <Sidebar role="admin" />

      {/* 🔹 Page content */}
      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-3xl font-bold mb-6 text-[#26bfef]">Pending Causes</h1>

        {pendingCauses.length === 0 ? (
          <p className="text-gray-400">No pending causes right now.</p>
        ) : (
          <div className="space-y-4">
            {pendingCauses.map((cause) => (
              <div key={cause._id} className="bg-[#1F2937] p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold">{cause.title}</h2>
                <p className="text-gray-300">
                  By: {cause.creator.username} ({cause.creator.email})
                </p>

                <div className="mt-4 flex gap-4">
                  

                  
                  <div className="mt-4 flex gap-4">

  {/* View Evidence */}
  <a
    href={`http://localhost:5000${cause.evidenceFile}`}
    target="_blank"
    rel="noopener noreferrer"
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
  >
    View Evidence
  </a>

  {/* Approve */}
  <button
    onClick={() => handleApprove(cause._id)}
    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
  >
    Approve
  </button>

  {/* Reject */}
  <button
    onClick={() => handleReject(cause._id)}
    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
  >
    Reject
  </button>

</div>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingCauses;
