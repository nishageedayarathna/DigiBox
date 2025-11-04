import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaPlusCircle,
  FaList,
  FaChartBar,
  FaUserShield,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";



const Sidebar = ({ role = "creator" }) => {
  const location = useLocation();

  const menus = {
    creator: [
      { path: "/creator/creator-dashboard", label: "Dashboard", icon: <FaHome /> },
      { path: "/creator/create-cause", label: "Create Cause", icon: <FaPlusCircle /> },
      { path: "/creator/causes", label: "My Causes", icon: <FaList /> },
    ],
    donor: [
      { path: "/donor-dashboard", label: "Dashboard", icon: <FaHome /> },
      { path: "/donor/causes", label: "Available Causes", icon: <FaChartBar /> },
      { path: "/donor/my-donations", label: "My Donations", icon: <FaList /> },
    ],
    admin: [
      { path: "/admin-dashboard", label: "Dashboard", icon: <FaHome /> },
      { path: "/admin/manage-users", label: "Manage Users", icon: <FaUsers /> },
      { path: "/admin/verify-causes", label: "Verify Causes", icon: <FaUserShield /> },
      { path: "/admin/reports", label: "Reports", icon: <FaChartBar /> },
    ],
  };

  const links = menus[role] || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-[#0a2e52] flex flex-col justify-between shadow-lg min-h-screen fixed">
      {/* 🔹 Top Branding */}
      <div>
        <div className="p-6 text-center border-b border-gray-700 flex flex-col items-center">
          <img src="/assets/logo.png" alt="DigiBox Logo" className="w-25 h-16 mb-2" />
          <p className="text-gray-300 capitalize"><b>{role} Panel </b></p>
        </div>

        {/* 🔸 Menu Links */}
        <nav className="mt-6 space-y-1">
          {links.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 transition ${
                  isActive
                    ? "bg-[#0a6c8b] text-white"
                    : "hover:bg-[#0a6c8b] text-gray-300"
                }`}
              >
                <span
                  className={`text-lg ${
                    isActive ? "text-white" : "text-[#26bfef]"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 🔻 Logout Section */}
      <div className="border-t border-gray-700 p-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
