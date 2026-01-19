import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";

const PendingCauses = () => {
  const [causes, setCauses] = useState([]);
  const [selectedCause, setSelectedCause] = useState(null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [signature, setSignature] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/gs/pending-causes",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setCauses(res.data);
  };

  /* ---------------- APPROVE ---------------- */
  const approveCause = async () => {
    if (!notes || !signature) {
      return alert("Verification notes and signature required");
    }

    const reader = new FileReader();
    reader.readAsDataURL(signature);
    reader.onloadend = async () => {
      await axios.put(
        `http://localhost:5000/api/gs/approve/${selectedCause._id}`,
        {
          verificationNotes: notes,
          signatureImage: reader.result,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Cause approved successfully");
      closeModals();
      fetchPending();
    };
  };

  /* ---------------- REJECT ---------------- */
  const rejectCause = async () => {
    if (!reason) return alert("Reason is required");

    await axios.put(
      `http://localhost:5000/api/gs/reject/${selectedCause._id}`,
      { reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Cause rejected");
    closeModals();
    fetchPending();
  };

  const closeModals = () => {
    setShowApprove(false);
    setShowReject(false);
    setSelectedCause(null);
    setNotes("");
    setReason("");
    setSignature(null);
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="gs" />

      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-xl font-semibold text-[#26bfef] mb-6">
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
              {causes.map((cause) => (
                <tr key={cause._id} className="border-b border-gray-700">
                  <td className="p-3">{cause.title}</td>
                  <td className="p-3 text-center">
                    {cause.creator.username}
                  </td>
                  <td className="p-3 text-center">
                    LKR {cause.requiredAmount}
                  </td>

                  {/* Evidence */}
                  <td className="p-3 text-center">
                    <a
                      href={`http://localhost:5000${cause.evidenceFile}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#26bfef] underline"
                    >
                      View
                    </a>

                  </td>

                  {/* Action */}
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCause(cause);
                        setShowApprove(true);
                      }}
                      className="px-3 py-1 bg-green-600 rounded text-xs"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCause(cause);
                        setShowReject(true);
                      }}
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
      {showApprove && (
        <Modal title="Approve Cause" onClose={closeModals}>
          <textarea
            placeholder="Verification Notes"
            className="w-full p-2 bg-[#374151] rounded mb-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSignature(e.target.files[0])}
            className="mb-4"
          />

          <button
            onClick={approveCause}
            className="w-full bg-green-600 py-2 rounded"
          >
            Confirm Approval
          </button>
        </Modal>
      )}

      {/* ---------------- REJECT MODAL ---------------- */}
      {showReject && (
        <Modal title="Reject Cause" onClose={closeModals}>
          <textarea
            placeholder="Reason for rejection"
            className="w-full p-2 bg-[#374151] rounded mb-4"
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
        <h2 className="text-lg font-semibold text-[#26bfef]">{title}</h2>
        <button onClick={onClose} className="text-gray-400">✕</button>
      </div>
      {children}
    </div>
  </div>
);

export default PendingCauses;
