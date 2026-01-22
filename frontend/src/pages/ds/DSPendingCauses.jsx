// DSPendingCauses.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { fetchDSPendingCauses, approveDSCause, rejectDSCause } from "../../services/dsService";
import { jsPDF } from "jspdf";

const DSPendingCauses = () => {
  const [causes, setCauses] = useState([]);
  const [selectedCause, setSelectedCause] = useState(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [signature, setSignature] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);

  useEffect(() => {
    loadPendingCauses();
  }, []);

  const loadPendingCauses = async () => {
    try {
      const res = await fetchDSPendingCauses();
      const filtered = res.data.filter(c => c.gsStatus === "approved" && c.dsStatus === "pending");
      setCauses(filtered);
    } catch (err) {
      console.error("Error fetching DS pending causes:", err);
    }
  };

  const closeModals = () => {
    setSelectedCause(null);
    setShowApprove(false);
    setShowReject(false);
    setNotes("");
    setReason("");
    setSignature(null);
    setPdfPreview(null);
  };

  // ---------------- GENERATE PDF PREVIEW ----------------
  const generatePDFPreview = () => {
    if (!notes || !signature) return alert("Notes and signature required");
    const reader = new FileReader();
    reader.readAsDataURL(signature);
    reader.onloadend = () => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("DS Approval Letter", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Cause Title: ${selectedCause.title}`, 20, 40);
      doc.text(`Beneficiary: ${selectedCause.beneficiaryName}`, 20, 50);
      doc.text(`Amount: LKR ${selectedCause.requiredAmount}`, 20, 60);
      doc.text(`Area: ${selectedCause.divisionName}, ${selectedCause.districtName}`, 20, 70);
      doc.text("Approval Notes:", 20, 80);
      doc.text(notes, 20, 90, { maxWidth: 170 });

      const img = reader.result;
      doc.addImage(img, "PNG", 20, 120, 50, 25);
      doc.text(`Signed by DS Officer: ${selectedCause.dsOfficer?.username || "You"}`, 20, 160);

      const blob = doc.output("blob");
      setPdfPreview(URL.createObjectURL(blob));
    };
  };

  // ---------------- APPROVE ----------------
  const handleApprove = async () => {
    if (!notes || !signature) return alert("Notes and signature required");
    const reader = new FileReader();
    reader.readAsDataURL(signature);
    reader.onloadend = async () => {
      try {
        await approveDSCause(selectedCause._id, {
          approvalNote: notes,
          signatureImage: reader.result,
        });
        alert("Cause approved and admin notified");
        closeModals();
        loadPendingCauses();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Approval failed");
      }
    };
  };

  // ---------------- REJECT ----------------
  const handleReject = async () => {
    if (!reason) return alert("Reason required");
    try {
      await rejectDSCause(selectedCause._id, reason);
      alert("Cause rejected and admin notified");
      closeModals();
      loadPendingCauses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Rejection failed");
    }
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="ds" />
      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-xl font-semibold text-[#26bfef] mb-6">
          Pending Causes for Approval
        </h1>

        {causes.length === 0 && <p>No pending causes available.</p>}

        {causes.map(c => (
          <div key={c._id} className="bg-[#1F2937] rounded-xl p-5 mb-4 shadow">
            <h2 className="text-lg font-bold text-[#26bfef]">{c.title}</h2>
            <p className="text-gray-300 my-2">{c.description}</p>
            <p className="text-gray-300"><strong>Beneficiary:</strong> {c.beneficiaryName}</p>
            <p className="text-gray-300"><strong>Amount:</strong> LKR {c.requiredAmount}</p>
            <p className="text-gray-300"><strong>Area:</strong> {c.divisionName}, {c.districtName}</p>

            <div className="mt-2 flex gap-4">
              {c.evidenceFile && (
                <a href={`http://localhost:5000${c.evidenceFile}`} target="_blank" rel="noreferrer" className="text-[#26bfef] underline">
                  Evidence
                </a>
              )}
              {c.gsDocument && (
                <a href={`http://localhost:5000${c.gsDocument}`} target="_blank" rel="noreferrer" className="text-[#10B981] underline">
                  GS Approval
                </a>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => { setSelectedCause(c); setShowApprove(true); }} className="px-3 py-1 bg-green-600 rounded">Approve</button>
              <button onClick={() => { setSelectedCause(c); setShowReject(true); }} className="px-3 py-1 bg-red-600 rounded">Reject</button>
            </div>
          </div>
        ))}

        {/* APPROVE MODAL */}
        {showApprove && selectedCause && (
          <Modal title="Approve Cause" onClose={closeModals}>
            <p className="text-gray-300 mb-2">Add approval note and upload your signature (PNG/JPG)</p>
            <textarea className="w-full p-2 bg-[#374151] rounded mb-3" placeholder="Approval Note" value={notes} onChange={e => setNotes(e.target.value)} />
            <input type="file" accept="image/png, image/jpeg" className="mb-3" onChange={e => setSignature(e.target.files[0])} />
            <button onClick={generatePDFPreview} className="w-full bg-blue-600 py-2 rounded mb-2">Generate PDF Preview</button>
            {pdfPreview && (
              <iframe src={pdfPreview} className="w-full h-80 border mb-2" title="PDF Preview"></iframe>
            )}
            <button onClick={handleApprove} className="w-full bg-green-600 py-2 rounded">Approve & Notify Admin</button>
          </Modal>
        )}

        {/* REJECT MODAL */}
        {showReject && selectedCause && (
          <Modal title="Reject Cause" onClose={closeModals}>
            <textarea className="w-full p-2 bg-[#374151] rounded mb-3" placeholder="Reason for rejection" value={reason} onChange={e => setReason(e.target.value)} />
            <button onClick={handleReject} className="w-full bg-red-600 py-2 rounded">Reject & Notify Admin</button>
          </Modal>
        )}
      </main>
    </div>
  );
};

/* MODAL COMPONENT */
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-[#1F2937] p-6 rounded-xl w-[400px]">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#26bfef]">{title}</h2>
        <button onClick={onClose} className="text-gray-400">✕</button>
      </div>
      {children}
    </div>
  </div>
);

export default DSPendingCauses;
