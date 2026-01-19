import React, { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { resetGSPassword } from "../../services/gsService";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password) return alert("Password cannot be empty");

    try {
      setLoading(true);
      await resetGSPassword(password);
      alert("Password updated successfully");
      setPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="gs" />

      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-xl font-semibold text-[#26bfef] mb-6">
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
            className="w-full bg-[#26bfef] py-2 rounded font-semibold hover:bg-[#0a6c8b]"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
