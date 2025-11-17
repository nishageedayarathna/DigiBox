import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

const ApprovedCauses = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/approved-causes", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setData(res.data.causes));
  }, []);

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="admin" />

      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-3xl font-bold text-[#26bfef] mb-6">
          Approved Causes
        </h1>

        {data.map((cause) => (
          <div
            key={cause._id}
            className="bg-[#1F2937] p-6 mb-4 rounded-lg shadow"
          >
            <h2 className="text-lg font-semibold">{cause.title}</h2>
            <p className="text-gray-300">
              By: {cause.creator.username} ({cause.creator.email})
            </p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ApprovedCauses;
