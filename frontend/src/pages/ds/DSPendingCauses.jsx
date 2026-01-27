import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { fetchDSPendingCauses, approveDSCause, rejectDSCause } from "../../services/dsService";
import { jsPDF } from "jspdf";

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-[#1F2937] rounded-lg p-6 max-w-2xl w-11/12 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  </div>
);
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
        <h1 className="text-3xl font-bold text-primary mb-8">
          Pending Causes for Approval
        </h1>

        {causes.length === 0 ? (
          <p className="text-gray-400">No pending causes available.</p>
        ) : (
          <div className="bg-[#1F2937] rounded-xl overflow-hidden shadow">
            <table className="w-full text-sm">
              <thead className="bg-[#374151] text-gray-300">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3">Beneficiary</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Evidence</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {causes.map((c) => (
                  <tr key={c._id} className="border-b border-gray-700 hover:bg-[#374151]/50 transition">
                    <td className="p-3 font-medium">{c.title}</td>
                    <td className="p-3 text-center text-sm">{c.beneficiaryName}</td>
                    <td className="p-3 text-center text-sm">{c.beneficiaryContact}</td>
                    <td className="p-3 text-center">LKR {c.requiredAmount}</td>
                    <td className="p-3 text-center">
                      <a
                        href={`http://localhost:5000${c.evidenceFile}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline hover:text-primary-light"
                      >
                        View
                      </a>
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => { setSelectedCause(c); setShowApprove(true); }}
                        className="px-3 py-1 bg-green-600 rounded text-xs hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setSelectedCause(c); setShowReject(true); }}
                        className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => { setSelectedCause(c); }}
                        className="px-3 py-1 bg-secondary rounded text-xs hover:bg-secondary-dark transition"
                        title="View Details"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedCause && !showApprove && !showReject && (
          <Modal title={`${selectedCause.title} - Full Details`} onClose={closeModals}>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Creator</p>
                  <p className="text-white font-medium">{selectedCause.creator?.username}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-medium">{selectedCause.creator?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">District</p>
                  <p className="text-white font-medium">{selectedCause.districtName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Division</p>
                  <p className="text-white font-medium">{selectedCause.divisionName}</p>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-3">
                <p className="text-gray-300 font-semibold mb-2">📋 Cause Information</p>
                <p className="text-sm text-gray-300"><span className="text-gray-500">Description:</span> {selectedCause.description}</p>
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Category:</span> {selectedCause.category}</p>
              </div>

              <div className="border-t border-gray-600 pt-3">
                <p className="text-gray-300 font-semibold mb-2">👤 Beneficiary Information</p>
                <p className="text-sm text-gray-300"><span className="text-gray-500">Name:</span> {selectedCause.beneficiaryName}</p>
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Phone:</span> {selectedCause.beneficiaryContact}</p>
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Address:</span> {selectedCause.beneficiaryAddress}</p>
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Bank:</span> {selectedCause.beneficiaryBank}</p>
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Account Name:</span> {selectedCause.beneficiaryAccountName}</p>
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Account #:</span> {selectedCause.beneficiaryAccountNumber}</p>
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Branch:</span> {selectedCause.beneficiaryBranch}</p>
              </div>

              <div className="border-t border-gray-600 pt-3">
                <p className="text-gray-300 font-semibold mb-2">💰 Fund Information</p>
                <p className="text-sm text-gray-300"><span className="text-gray-500">Required Amount:</span> LKR {selectedCause.requiredAmount}</p>
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Funds Raised:</span> LKR {selectedCause.fundsRaised || 0}</p>
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">Donors Count:</span> {selectedCause.donorsCount || 0}</p>
              </div>

              <div className="border-t border-gray-600 pt-3">
                <p className="text-gray-300 font-semibold mb-2">📄 Evidence Files</p>
                <div className="flex gap-2 flex-wrap">
                  {selectedCause.evidenceFile && (
                    <a
                      href={`http://localhost:5000${selectedCause.evidenceFile}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline hover:text-primary-light"
                    >
                      View Evidence
                    </a>
                  )}
                  {selectedCause.gsDocument && (
                    <a
                      href={`http://localhost:5000${selectedCause.gsDocument}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-400 underline hover:text-green-300"
                    >
                      GS Approval Letter
                    </a>
                  )}
                </div>
              </div>

              <button
                onClick={closeModals}
                className="w-full bg-gray-600 py-2 rounded mt-4"
              >
                Close
              </button>
            </div>
          </Modal>
        )}

        {/* APPROVE MODAL */}
        {showApprove && selectedCause && (
          <Modal title="Approve Cause" onClose={closeModals}>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">Add approval note and upload your signature (PNG/JPG)</p>
              <textarea
                className="w-full p-3 bg-[#374151] rounded text-white border border-gray-600 focus:border-primary outline-none"
                placeholder="Approval Note..."
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div>
                <label className="text-gray-300 text-sm">Signature Image</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  className="w-full mt-2 p-2 bg-[#374151] rounded text-gray-300"
                  onChange={(e) => setSignature(e.target.files[0])}
                />
              </div>
              <button
                onClick={generatePDFPreview}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white transition"
              >
                Generate PDF Preview
              </button>
              {pdfPreview && (
                <iframe src={pdfPreview} className="w-full h-80 border border-gray-600 rounded" title="PDF Preview"></iframe>
              )}
              <button
                onClick={handleApprove}
                className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-white transition"
              >
                Approve & Notify Admin
              </button>
            </div>
          </Modal>
        )}

        {/* REJECT MODAL */}
        {showReject && selectedCause && (
          <Modal title="Reject Cause" onClose={closeModals}>
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">Provide reason for rejection</p>
              <textarea
                className="w-full p-3 bg-[#374151] rounded text-white border border-gray-600 focus:border-primary outline-none"
                placeholder="Reason for rejection..."
                rows="4"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button
                onClick={handleReject}
                className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-white transition"
              >
                Reject & Notify Admin
              </button>
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
};

export default DSPendingCauses;
