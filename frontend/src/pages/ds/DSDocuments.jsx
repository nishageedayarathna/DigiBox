import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";

const DSDocuments = () => {
  const [docs, setDocs] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/ds/documents", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setDocs(res.data));
  }, []);

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="ds" />

      <div className="flex-1 p-8 ml-64">
        <h1 className="text-xl text-[#26bfef] mb-6">DS Documents</h1>

        <ul className="space-y-3">
          {docs.map((d) => (
            <li key={d._id} className="bg-[#1f2937] p-4 rounded">
              <a href={d.fileUrl} target="_blank" rel="noreferrer">
                {d.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DSDocuments;
