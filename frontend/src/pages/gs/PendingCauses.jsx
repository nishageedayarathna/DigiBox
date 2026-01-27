import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";
import { jsPDF } from "jspdf";

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-[#1F2937] rounded-lg p-6 max-w-2xl w-11/12 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  </div>
);

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

  const closeModals = () => {
    setSelectedCause(null);
    setShowApprove(false);
    setShowReject(false);
    setNotes("");
    setReason("");
    setSignature(null);
    setPdfPreview(null);
  };

  /* ---------------- GENERATE PDF PREVIEW ---------------- */
  const generatePDFPreview = () => {
    if (!notes || !signature) return alert("Verification notes and signature required");

    const reader = new FileReader();
    reader.readAsDataURL(signature);
    reader.onloadend = () => {
      const doc = new jsPDF();
      
      // ========== LETTERHEAD DESIGN ==========
      // Header background
      doc.setFillColor(139, 92, 246); // Purple color
      doc.rect(0, 0, 210, 35, 'F');
      
      // Logo placeholder circle
      doc.setFillColor(255, 255, 255);
      doc.circle(20, 17, 8, 'F');
      doc.setTextColor(139, 92, 246);
      doc.setFontSize(10);
      doc.text("DB", 16.5, 19);
      
      // Organization name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text("DigiBox - Grama Seva Division", 105, 15, { align: "center" });
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Official Verification & Approval Document", 105, 23, { align: "center" });
      
      // Decorative line
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(0.5);
      doc.line(20, 32, 190, 32);
      
      // ========== DOCUMENT TITLE ==========
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text("GRAMA SEVA OFFICER - VERIFICATION CERTIFICATE", 105, 45, { align: "center" });
      
      // Reference number
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100, 100, 100);
      const refNumber = `GS/${new Date().getFullYear()}/` + Math.random().toString(36).substr(2, 6).toUpperCase();
      doc.text(`Reference No: ${refNumber}`, 105, 52, { align: "center" });
      doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 105, 57, { align: "center" });
      
      // ========== CAUSE INFORMATION SECTION ==========
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("Cause Information", 20, 68);
      
      // Box around cause info
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(20, 70, 170, 48);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      let yPos = 76;
      doc.setFont(undefined, 'bold');
      doc.text("Title:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(selectedCause.title, 55, yPos, { maxWidth: 130 });
      
      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("Creator:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(selectedCause.creator.username, 55, yPos);
      
      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("Required Amount:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`LKR ${Number(selectedCause.requiredAmount).toLocaleString('en-US')}`, 55, yPos);
      
      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("Beneficiary:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(selectedCause.beneficiaryName || "N/A", 55, yPos);
      
      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("NIC Number:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(selectedCause.beneficiaryNIC || "N/A", 55, yPos);
      
      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.text("Area:", 25, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`${selectedCause.areaName}, ${selectedCause.divisionName}`, 55, yPos);
      
      // ========== VERIFICATION SECTION ==========
      yPos = 125;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text("Verification Notes", 20, yPos);
      
      // Box for notes
      doc.setLineWidth(0.3);
      doc.rect(20, yPos + 2, 170, 35);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(notes, 25, yPos + 8, { maxWidth: 160, lineHeightFactor: 1.5 });
      
      // ========== SIGNATURE SECTION ==========
      yPos = 170;
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text("Verified and Approved by:", 20, yPos);
      
      // Signature box
      doc.setLineWidth(0.3);
      doc.rect(20, yPos + 3, 70, 35);
      doc.addImage(reader.result, "PNG", 25, yPos + 5, 60, 28);
      
      // Officer details
      yPos += 40;
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`${selectedCause.gsOfficer?.username || "GS Officer"}`, 20, yPos);
      doc.setFont(undefined, 'normal');
      doc.text("Grama Seva Officer", 20, yPos + 5);
      doc.text(`${selectedCause.areaName}`, 20, yPos + 10);
      
      // Stamp placeholder
      doc.setDrawColor(139, 92, 246);
      doc.setLineWidth(1);
      doc.circle(150, yPos - 10, 15, 'S');
      doc.setFontSize(8);
      doc.setTextColor(139, 92, 246);
      doc.text("OFFICIAL", 145, yPos - 12);
      doc.text("SEAL", 148, yPos - 8);
      
      // ========== FOOTER ==========
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(20, 270, 190, 270);
      
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.setFont(undefined, 'italic');
      doc.text("This is an official computer-generated document and requires no manual signature.", 105, 275, { align: "center" });
      
      doc.setFont(undefined, 'bold');
      doc.setTextColor(139, 92, 246);
      doc.text("Powered by: DigiBox", 105, 282, { align: "center" });
      doc.setFont(undefined, 'normal');
      doc.setFontSize(7);
      doc.text("Digital Community Fundraising Platform", 105, 287, { align: "center" });

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
        // Generate the same formatted PDF as preview
        const doc = new jsPDF();
        
        // ========== LETTERHEAD DESIGN ==========
        doc.setFillColor(139, 92, 246);
        doc.rect(0, 0, 210, 35, 'F');
        
        doc.setFillColor(255, 255, 255);
        doc.circle(20, 17, 8, 'F');
        doc.setTextColor(139, 92, 246);
        doc.setFontSize(10);
        doc.text("DB", 16.5, 19);
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text("DigiBox - Grama Seva Division", 105, 15, { align: "center" });
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text("Official Verification & Approval Document", 105, 23, { align: "center" });
        
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(0.5);
        doc.line(20, 32, 190, 32);
        
        // ========== DOCUMENT TITLE ==========
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text("GRAMA SEVA OFFICER - VERIFICATION CERTIFICATE", 105, 45, { align: "center" });
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        const refNumber = `GS/${new Date().getFullYear()}/` + Math.random().toString(36).substr(2, 6).toUpperCase();
        doc.text(`Reference No: ${refNumber}`, 105, 52, { align: "center" });
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 105, 57, { align: "center" });
        
        // ========== CAUSE INFORMATION SECTION ==========
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Cause Information", 20, 68);
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.rect(20, 70, 170, 48);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        let yPos = 76;
        doc.setFont(undefined, 'bold');
        doc.text("Title:", 25, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(selectedCause.title, 55, yPos, { maxWidth: 130 });
        
        yPos += 7;
        doc.setFont(undefined, 'bold');
        doc.text("Creator:", 25, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(selectedCause.creator.username, 55, yPos);
        
        yPos += 7;
        doc.setFont(undefined, 'bold');
        doc.text("Required Amount:", 25, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`LKR ${Number(selectedCause.requiredAmount).toLocaleString('en-US')}`, 55, yPos);
        
        yPos += 7;
        doc.setFont(undefined, 'bold');
        doc.text("Beneficiary:", 25, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(selectedCause.beneficiaryName || "N/A", 55, yPos);
        
        yPos += 7;
        doc.setFont(undefined, 'bold');
        doc.text("NIC Number:", 25, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(selectedCause.beneficiaryNIC || "N/A", 55, yPos);
        
        yPos += 7;
        doc.setFont(undefined, 'bold');
        doc.text("Area:", 25, yPos);
        doc.setFont(undefined, 'normal');
        doc.text(`${selectedCause.areaName}, ${selectedCause.divisionName}`, 55, yPos);
        
        // ========== VERIFICATION SECTION ==========
        yPos = 125;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text("Verification Notes", 20, yPos);
        
        doc.setLineWidth(0.3);
        doc.rect(20, yPos + 2, 170, 35);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(notes, 25, yPos + 8, { maxWidth: 160, lineHeightFactor: 1.5 });
        
        // ========== SIGNATURE SECTION ==========
        yPos = 170;
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text("Verified and Approved by:", 20, yPos);
        
        doc.setLineWidth(0.3);
        doc.rect(20, yPos + 3, 70, 35);
        doc.addImage(reader.result, "PNG", 25, yPos + 5, 60, 28);
        
        yPos += 40;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`${selectedCause.gsOfficer?.username || "GS Officer"}`, 20, yPos);
        doc.setFont(undefined, 'normal');
        doc.text("Grama Seva Officer", 20, yPos + 5);
        doc.text(`${selectedCause.areaName}`, 20, yPos + 10);
        
        doc.setDrawColor(139, 92, 246);
        doc.setLineWidth(1);
        doc.circle(150, yPos - 10, 15, 'S');
        doc.setFontSize(8);
        doc.setTextColor(139, 92, 246);
        doc.text("OFFICIAL", 145, yPos - 12);
        doc.text("SEAL", 148, yPos - 8);
        
        // ========== FOOTER ==========
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(20, 270, 190, 270);
        
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.text("This is an official computer-generated document and requires no manual signature.", 105, 275, { align: "center" });
        
        doc.setFont(undefined, 'bold');
        doc.setTextColor(139, 92, 246);
        doc.text("Powered by: DigiBox", 105, 282, { align: "center" });
        doc.setFont(undefined, 'normal');
        doc.setFontSize(7);
        doc.text("Digital Community Fundraising Platform", 105, 287, { align: "center" });

        // Convert PDF to base64 to send to backend
        const pdfBase64 = doc.output('datauristring');

        await axios.put(
          `http://localhost:5000/api/gs/approve/${selectedCause._id}`,
          {
            verificationNotes: notes,
            signatureImage: reader.result,
            pdfDocument: pdfBase64, // Send the formatted PDF
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

export default PendingCauses;
