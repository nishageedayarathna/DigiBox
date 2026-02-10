import React, { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import AlertModal from "../../components/AlertModal";
import axios from "axios";

const DSResetPassword = () => {
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });
  const [isResetting, setIsResetting] = useState(false);
  const token = localStorage.getItem("token");

  const reset = async () => {
    setIsResetting(true);
    try {
      await axios.put(
        "http://localhost:5000/api/ds/reset-password",
        { password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ isOpen: true, message: "Password updated", type: "success" });
      setPassword("");
    } catch (err) {
      console.error(err);
      setAlert({ isOpen: true, message: err.response?.data?.message || "Error updating password", type: "error" });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="ds" />

      <div className="flex-1 p-8 ml-64">
        <h1 className="text-xl text-primary mb-4">Reset Password</h1>

        <input
          type="password"
          className="bg-[#374151] p-2 rounded w-72 mb-3"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        <button 
          onClick={reset} 
          disabled={isResetting}
          className="bg-primary px-4 py-2 rounded hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isResetting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            "Update"
          )}
        </button>

        <AlertModal 
          message={alert.message} 
          isOpen={alert.isOpen} 
          onClose={() => setAlert({ ...alert, isOpen: false })} 
          type={alert.type}
        />
      </div>
    </div>
  );
};

export default DSResetPassword;
