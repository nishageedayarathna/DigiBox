import React, { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";

const DSResetPassword = () => {
  const [password, setPassword] = useState("");
  const token = localStorage.getItem("token");

  const reset = async () => {
    await axios.put(
      "http://localhost:5000/api/ds/reset-password",
      { password },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Password updated");
  };

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="ds" />

      <div className="flex-1 p-8 ml-64">
        <h1 className="text-xl text-[#26bfef] mb-4">Reset Password</h1>

        <input
          type="password"
          className="bg-[#374151] p-2 rounded w-72 mb-3"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={reset} className="bg-[#26bfef] px-4 py-2 rounded">
          Update
        </button>
      </div>
    </div>
  );
};

export default DSResetPassword;
