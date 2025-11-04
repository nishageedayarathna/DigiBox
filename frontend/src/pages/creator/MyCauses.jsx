import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

const MyCauses = () => {
  // 🔹 Mock data for now — replace later with API response
  const [causes, setCauses] = useState([
    {
      _id: "1",
      title: "Help Local School Renovation",
      description: "Raising funds for repairing classrooms and providing new desks.",
      targetAmount: 25000,
      raisedAmount: 18000,
      status: "Approved",
      dateCreated: "2025-10-20",
    },
    {
      _id: "2",
      title: "Support for Medical Treatment",
      description: "Need urgent help for a community member's surgery.",
      targetAmount: 40000,
      raisedAmount: 12000,
      status: "Pending",
      dateCreated: "2025-10-24",
    },
    {
      _id: "3",
      title: "Temple Roof Maintenance",
      description: "Raising funds to repair temple roof before monsoon.",
      targetAmount: 15000,
      raisedAmount: 0,
      status: "Rejected",
      dateCreated: "2025-10-10",
    },
  ]);

  // ✅ Later you can use this to fetch from backend:
  /*
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/creator/my-causes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCauses(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCauses();
  }, []);
  */

  // 🔹 Status badge styles
  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "text-green-400 bg-green-900/40 border border-green-500";
      case "Pending":
        return "text-yellow-400 bg-yellow-900/40 border border-yellow-500";
      case "Rejected":
        return "text-red-400 bg-red-900/40 border border-red-500";
      default:
        return "text-gray-400 bg-gray-800 border border-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <FaCheckCircle className="inline-block mr-1" />;
      case "Pending":
        return <FaClock className="inline-block mr-1" />;
      case "Rejected":
        return <FaTimesCircle className="inline-block mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="creator" />

      {/* Main section */}
      <main className="flex-1 ml-0 md:ml-64 p-8">
        <h1 className="text-3xl font-bold text-[#26bfef] mb-8"><center>My Causes</center></h1>

        {/* Table container */}
        <div className="bg-[#1F2937] rounded-2xl shadow-lg overflow-x-auto">
          <table className="min-w-full text-left text-gray-300">
            <thead>
              <tr className="bg-[#0a2e52] text-[#26bfef]">
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Target</th>
                <th className="py-4 px-6">Raised</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Created On</th>
              </tr>
            </thead>
            <tbody>
              {causes.map((cause) => (
                <tr
                  key={cause._id}
                  className="border-b border-gray-700 hover:bg-[#0f1c2f] transition"
                >
                  <td className="py-4 px-6 font-semibold">{cause.title}</td>
                  <td className="py-4 px-6">LKR {cause.targetAmount.toLocaleString()}</td>
                  <td className="py-4 px-6 text-[#26bfef] font-medium">
                    LKR {cause.raisedAmount.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center justify-center w-fit ${getStatusStyle(
                        cause.status
                      )}`}
                    >
                      {getStatusIcon(cause.status)}
                      {cause.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400">
                    {new Date(cause.dateCreated).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {causes.length === 0 && (
          <p className="text-center text-gray-400 mt-8">
            No causes created yet.
          </p>
        )}
      </main>
    </div>
  );
};

export default MyCauses;
