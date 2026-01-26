import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => { fetchDocuments(); }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/gs/documents", { headers: { Authorization: `Bearer ${token}` } });
      setDocs(res.data);
    } catch (err) { console.error("Error fetching documents:", err); }
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="gs" />
      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-xl font-semibold text-primary mb-6">GS Verification Documents</h1>
        <div className="bg-[#1F2937] p-6 rounded-xl space-y-4">
          {docs.length === 0 && <p className="text-gray-400 text-sm">No documents available yet.</p>}
          {docs.map((doc) => (
            <div key={doc._id} className="flex justify-between items-center bg-[#374151] p-3 rounded">
              <div>
                <p className="text-sm font-semibold">{doc.title}</p>
                <p className="text-gray-400 text-xs">
                  GS Officer: {doc.gsOfficer?.username || "N/A"} | Approved on: {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <a href={`http://localhost:5000${doc.gsDocument}`} target="_blank" rel="noreferrer" className="text-primary text-sm underline">View PDF</a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Documents;
