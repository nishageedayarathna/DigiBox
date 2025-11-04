import React from "react";
import { FaBell, FaUserCircle, FaCog } from "react-icons/fa";

const Topbar = ({ username = "User", role = "Creator" }) => {
  return (
    <header className="flex justify-between items-center px-8 py-4 bg-[#1F2937] border-b border-gray-700 shadow-md">
      {/* 🏷️ Left Side - Page Title */}
      <div>
        <h1 className="text-xl font-bold text-[#26bfef]">Welcome, {username} 👋</h1>
        <p className="text-gray-400 text-sm capitalize">{role} Dashboard</p>
      </div>

      {/* ⚙️ Right Side - Icons */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button
          className="relative hover:text-[#26bfef] transition"
          title="Notifications"
        >
          <FaBell size={20} />
          <span className="absolute -top-1 -right-2 bg-red-500 text-xs rounded-full px-1">
            2
          </span>
        </button>

        {/* Settings */}
        <button className="hover:text-[#26bfef] transition" title="Settings">
          <FaCog size={20} />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <FaUserCircle size={28} className="text-[#26bfef]" />
          <span className="text-gray-300 text-sm">{username}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
