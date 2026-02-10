import React, { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import AlertModal from "../../components/AlertModal";
import { resetGSPassword } from "../../services/gsService";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });

  const handleSubmit = async () => {
    if (!password) return setAlert({ isOpen: true, message: "Password cannot be empty", type: "warning" });

    try {
      setLoading(true);
      await resetGSPassword(password);
      setAlert({ isOpen: true, message: "Password updated successfully", type: "success" });
      setPassword("");
    } catch (err) {
      setAlert({ isOpen: true, message: err.response?.data?.message || "Password reset failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="gs" />

      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-xl font-semibold text-primary mb-6">
          Reset Password
        </h1>

        <div className="bg-[#1F2937] p-6 rounded-xl max-w-md">
          <input
            type="password"
            placeholder="New Password"
            className="w-full mb-4 p-3 rounded bg-[#374151] text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-primary py-2 rounded font-semibold hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </button>
        </div>

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

export default ResetPassword;
