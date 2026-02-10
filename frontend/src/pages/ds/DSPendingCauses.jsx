import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { fetchDSPendingCauses, approveDSCause, rejectDSCause } from "../../services/dsService";
import AlertModal from "../../components/AlertModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import { jsPDF } from "jspdf";

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-[#1F2937] rounded-lg p-6 max-w-2xl w-11/12 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition text-2xl leading-none"
          title="Close"
        >
          ×
        </button>
      </div>
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
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

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
    if (!notes || !signature) return setAlert({ isOpen: true, message: "Notes and signature required", type: "warning" });
    setIsGeneratingPDF(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(signature);
      reader.onloadend = () => {
      const doc = new jsPDF();
      
      // ========== LETTERHEAD DESIGN ==========
      doc.setFillColor(99, 102, 241); // Indigo
      doc.rect(0, 0, 210, 35, 'F');

      doc.setFillColor(255, 255, 255);
      doc.circle(20, 17, 8, 'F');
      doc.setTextColor(99, 102, 241);
      doc.setFontSize(10);
      doc.text("DB", 16.5, 19);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text("DigiBox - Divisional Secretariat", 105, 15, { align: "center" });

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Final Approval & Authorization Document", 105, 23, { align: "center" });

      doc.setDrawColor(139, 92, 246);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);

      // ========== DOCUMENT TITLE ==========
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text("DIVISIONAL SECRETARY - FINAL APPROVAL CERTIFICATE", 105, 45, { align: "center" });

      // Reference
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      const refNumber = `DS/${new Date().getFullYear()}/` + Math.random().toString(36).substr(2, 6).toUpperCase();
      doc.text(`Reference No: ${refNumber}`, 105, 52, { align: "center" });
      doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 105, 57, { align: "center" });

      // ========== CAUSE INFORMATION ==========
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("Cause Details", 20, 68);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(20, 70, 170, 55);

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      let yPos = 76;
      doc.setFont(undefined, 'bold');
      doc.text("Title:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(selectedCause.title, 55, yPos, { maxWidth: 130 });

      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("Beneficiary:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(selectedCause.beneficiaryName, 55, yPos);

      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("NIC Number:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(selectedCause.beneficiaryNIC || "N/A", 55, yPos);

      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("Required Amount:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`LKR ${Number(selectedCause.requiredAmount).toLocaleString('en-US')}`, 55, yPos);

      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("Location:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`${selectedCause.divisionName}, ${selectedCause.districtName}`, 55, yPos);

      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("GS Area:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(selectedCause.areaName, 55, yPos);

      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("GS Verification:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(34, 197, 94);
      doc.text("✓ Verified by GS Officer", 55, yPos);
      doc.setTextColor(0, 0, 0);

      // ========== APPROVAL NOTES ==========
      yPos = 132;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("Final Approval Notes", 20, yPos);

      doc.setLineWidth(0.3);
      doc.rect(20, yPos + 2, 170, 35);

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(notes, 25, yPos + 8, { maxWidth: 160, lineHeightFactor: 1.5 });

      // APPROVED STAMP
      doc.setFillColor(34, 197, 94);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.rect(140, yPos + 8, 45, 12, 'F');
      doc.text("APPROVED", 162.5, yPos + 16, { align: "center" });

      // ========== SIGNATURE ==========
      yPos = 177;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text("Authorized and Approved by:", 20, yPos);

      doc.setLineWidth(0.3);
      doc.rect(20, yPos + 3, 70, 35);
      doc.addImage(reader.result, "PNG", 25, yPos + 5, 60, 28);

      yPos += 40;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`${selectedCause.dsOfficer?.username || "DS Officer"}`, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text("Divisional Secretary", 20, yPos + 5);
      doc.text(`${selectedCause.divisionName}`, 20, yPos + 10);
      doc.text(`${selectedCause.districtName}`, 20, yPos + 15);

      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(1.5);
      doc.circle(150, yPos - 5, 18, 'S');
      doc.setFontSize(9);
      doc.setTextColor(99, 102, 241);
      doc.setFont(undefined, 'bold');
      doc.text("OFFICIAL", 143, yPos - 8);
      doc.text("SEAL", 146, yPos - 3);
      doc.setFontSize(7);
      doc.text("DIVISIONAL", 141, yPos + 2);
      doc.text("SECRETARIAT", 139, yPos + 6);

      // FOOTER
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(20, 265, 190, 265);

      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.text("This is an official computer-generated document with digital authentication.", 105, 270, { align: "center" });
      doc.text("Valid for fundraising purposes on the DigiBox platform.", 105, 275, { align: "center" });

      doc.setFont(undefined, 'bold');
      doc.setTextColor(99, 102, 241);
      doc.text("Powered by: DigiBox", 105, 282, { align: "center" });
      doc.setFont(undefined, 'normal');
      doc.setFontSize(7);
      doc.text("Digital Community Fundraising Platform", 105, 287, { align: "center" });

      const blob = doc.output("blob");
      setPdfPreview(URL.createObjectURL(blob));
      };
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, message: "Failed to generate PDF", type: "error" });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleApprove = async () => {
    if (!notes || !signature) return setAlert({ isOpen: true, message: "Notes and signature required", type: "warning" });
    setIsApproving(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(signature);
      await new Promise((resolve) => {
        reader.onloadend = async () => {
          try {
            await approveDSCause(selectedCause._id, {
              approvalNote: notes,
              signatureImage: reader.result,
            });
            setAlert({ isOpen: true, message: "Cause approved and admin notified", type: "success" });
            closeModals();
            loadPendingCauses();
          } catch (err) {
            console.error(err);
            setAlert({ isOpen: true, message: err.response?.data?.message || "Approval failed", type: "error" });
          } finally {
            resolve();
          }
        };
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!reason) return setAlert({ isOpen: true, message: "Reason required", type: "warning" });
    setIsRejecting(true);
    try {
      await rejectDSCause(selectedCause._id, reason);
      setAlert({ isOpen: true, message: "Cause rejected and admin notified", type: "success" });
      closeModals();
      loadPendingCauses();
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, message: err.response?.data?.message || "Rejection failed", type: "error" });
    } finally {
      setIsRejecting(false);
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
                    <td className="p-3 text-center">LKR {Number(c.requiredAmount).toLocaleString()}</td>
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

        {/* ------------------- DETAILS MODAL ------------------- */}
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
                <p className="text-sm text-gray-300 mt-1"><span className="text-gray-500">NIC Number:</span> {selectedCause.beneficiaryNIC}</p>
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
                <p className="text-gray-300 font-semibold mb-2">📄 Evidence File</p>
                <a
                  href={`http://localhost:5000${selectedCause.evidenceFile}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline hover:text-primary-light"
                >
                  View {selectedCause.evidenceFileType === "pdf" ? "PDF" : "Image"}
                </a>
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

        {/* ------------------- APPROVE MODAL ------------------- */}
        {showApprove && selectedCause && (
          <Modal title="Approve Cause" onClose={closeModals}>
            <div className="space-y-4">
              {!pdfPreview ? (
                <>
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
                    disabled={isGeneratingPDF}
                    className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingPDF ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating PDF...
                      </span>
                    ) : (
                      "Generate PDF Preview"
                    )}
                  </button>
                </>
              ) : (
                <>
                  <iframe src={pdfPreview} className="w-full h-80 border border-gray-600 rounded" title="PDF Preview"></iframe>
                  <button
                    onClick={() => setPdfPreview(null)}
                    className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded text-white transition"
                  >
                    Edit Signature / Note
                  </button>
                </>
              )}
              {!pdfPreview && (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 rounded text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Approving...
                    </span>
                  ) : (
                    "Approve & Notify Admin"
                  )}
                </button>
              )}
            </div>
          </Modal>
        )}

        {/* ------------------- REJECT MODAL ------------------- */}
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
                disabled={isRejecting}
                className="w-full bg-red-600 hover:bg-red-700 py-2 rounded text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Rejecting...
                  </span>
                ) : (
                  "Reject & Notify Admin"
                )}
              </button>
            </div>
          </Modal>
        )}

        <AlertModal 
          message={alert.message} 
          isOpen={alert.isOpen} 
          onClose={() => setAlert({ ...alert, isOpen: false })} 
          type={alert.type}
        />
      </main>
    </div>
  );
};

export default DSPendingCauses;
