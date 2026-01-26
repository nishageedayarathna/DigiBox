import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";
import { jsPDF } from "jspdf";

const PendingCauses = () => {
  const [causes, setCauses] = useState([]);
  const [selectedCause, setSelectedCause] = useState(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [signature, setSignature] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/gs/pending-causes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCauses(res.data);
    } catch (err) {
      console.error("Error fetching pending causes:", err);
    }
  };

  /* ---------------- GENERATE PDF PREVIEW ---------------- */
  const generatePDFPreview = () => {
    if (!notes || !signature) return alert("Verification notes and signature required");

    const reader = new FileReader();
    reader.readAsDataURL(signature);
    reader.onloadend = () => {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("GS Approval Letter", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Cause Title: ${selectedCause.title}`, 20, 40);
      doc.text(`Creator: ${selectedCause.creator.username}`, 20, 50);
      doc.text(`Amount: LKR ${selectedCause.requiredAmount}`, 20, 60);
      doc.text(`Beneficiary: ${selectedCause.beneficiaryName || "N/A"}`, 20, 70);
      doc.text("Verification Notes:", 20, 80);
      doc.text(notes, 20, 90, { maxWidth: 170 });

      doc.addImage(reader.result, "PNG", 20, 130, 50, 25);
      doc.text(`Signed by: ${selectedCause.gsOfficer?.username || "You"}`, 20, 160);

      const blob = doc.output("blob");
      setPdfPreview(URL.createObjectURL(blob));
    };
  };

  /* ---------------- APPROVE CAUSE ---------------- */
  const approveCause = async () => {
    if (!notes || !signature) return alert("Notes and signature required");

    const reader = new FileReader();
    reader.readAsDataURL(signature);
    reader.onloadend = async () => {
      try {
        await axios.put(
          `http://localhost:5000/api/gs/approve/${selectedCause._id}`,
          {
            verificationNotes: notes,
            signatureImage: reader.result,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert("Cause approved and forwarded to DS Officer");
        closeModals();
        fetchPending();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Approval failed");
      }
    };
  };

  /* ---------------- REJECT CAUSE ---------------- */
  const rejectCause = async () => {
    if (!reason) return alert("Reason is required");

    try {
      await axios.put(
        `http://localhost:5000/api/gs/reject/${selectedCause._id}`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Cause rejected successfully");
      closeModals();
      fetchPending();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Rejection failed");
    }
  };

  const closeModals = () => {
    setShowApprove(false);
    setShowReject(false);
    setSelectedCause(null);
    setNotes("");
    setReason("");
    setSignature(null);
    setPdfPreview(null);
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="gs" />

      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-xl font-semibold text-primary mb-6">
          Pending Causes for Verification
        </h1>

        <div className="bg-[#1F2937] rounded-xl overflow-hidden shadow">
          <table className="w-full text-sm">
            <thead className="bg-[#374151] text-gray-300">
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3">Beneficiary</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Evidence</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {causes.map((c) => (
                <tr key={c._id} className="border-b border-gray-700">
                  <td className="p-3">{c.title}</td>
                  <td className="p-3 text-center">{c.beneficiaryName}</td>
                  <td className="p-3 text-center">LKR {c.requiredAmount}</td>
                  <td className="p-3 text-center">
                    <a
                      href={`http://localhost:5000${c.evidenceFile}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      View
                    </a>
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => { setSelectedCause(c); setShowApprove(true); }}
                      className="px-3 py-1 bg-green-600 rounded text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => { setSelectedCause(c); setShowReject(true); }}
                      className="px-3 py-1 bg-red-600 rounded text-xs"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* ---------------- APPROVE MODAL ---------------- */}
      {showApprove && selectedCause && (
        <Modal title="Approve Cause" onClose={closeModals}>
          <p className="text-gray-300 mb-2">
            Add verification notes and upload your signature (PNG/JPG)
          </p>
          {/* Inputs visible even after PDF generated */}
          <textarea
            className="w-full p-2 bg-[#374151] rounded mb-3"
            placeholder="Verification Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!!pdfPreview} // disable editing only after generating PDF if you want
          />
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={(e) => setSignature(e.target.files[0])}
            className="mb-3"
            disabled={!!pdfPreview} // optional: lock file after generating PDF
          />
          {signature && (
            <img
              src={URL.createObjectURL(signature)}
              alt="signature preview"
              className="h-20 mb-3 border border-gray-500"
            />
          )}

          {!pdfPreview && (
            <button
              onClick={generatePDFPreview}
              className="w-full bg-blue-600 py-2 rounded mb-2"
            >
              Generate Letter Preview
            </button>
          )}

          {/* Show PDF preview and Edit button */}
          {pdfPreview && (
            <div className="mb-3">
              <iframe
                src={pdfPreview}
                className="w-full h-80 border mb-2"
                title="PDF Preview"
              ></iframe>
              <button
                onClick={() => setPdfPreview(null)}
                className="w-full bg-yellow-600 py-2 rounded mb-2"
              >
                Edit Notes / Signature
              </button>
            </div>
          )}

          {/* Final approval button */}
          <button
            onClick={approveCause}
            className="w-full bg-green-600 py-2 rounded"
          >
            Approve & Forward to DS Officer
          </button>
        </Modal>
      )}

      {/* ---------------- REJECT MODAL ---------------- */}
      {showReject && (
        <Modal title="Reject Cause" onClose={closeModals}>
          <textarea
            className="w-full p-2 bg-[#374151] rounded mb-4"
            placeholder="Reason for rejection"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            onClick={rejectCause}
            className="w-full bg-red-600 py-2 rounded"
          >
            Confirm Rejection
          </button>
        </Modal>
      )}
    </div>
  );
};

/* ---------------- MODAL ---------------- */
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-[#1F2937] p-6 rounded-xl w-[400px]">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary">{title}</h2>
        <button onClick={onClose} className="text-gray-400">
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default PendingCauses;
