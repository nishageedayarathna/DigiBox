import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { fetchGSDocuments } from "../../services/gsService";

const Documents = () => {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    fetchGSDocuments()
      .then((res) => setDocs(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="gs" />

      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-xl font-semibold text-[#26bfef] mb-6">
          Verification Documents
        </h1>

        <div className="bg-[#1F2937] p-6 rounded-xl space-y-3">
          {docs.length === 0 && (
            <p className="text-gray-400 text-sm">
              No documents available yet.
            </p>
          )}

          {docs.map((doc) => (
            <div key={doc._id} className="flex justify-between items-center">
              <p className="text-sm">{doc.title}</p>

              <a
                href={doc.gsVerificationPDF}
                target="_blank"
                rel="noreferrer"
                className="text-[#26bfef] text-sm underline"
              >
                View PDF
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Documents;
