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
  FaPeopleCarry,
  FaClipboardList,
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
      { path: "/donor/dashboard", label: "Dashboard", icon: <FaHome /> },
      { path: "/donor/causes", label: "Available Causes", icon: <FaChartBar /> },
      { path: "/donor/my-donations", label: "My Donations", icon: <FaList /> },
    ],

    // Sidebar.jsx (admin menu)

    admin: [
      { path: "/admin/admin-dashboard", label: "Dashboard", icon: <FaHome /> },
      { path: "/admin/approve-causes", label: "Admin Approval", icon: <FaList /> },
      { path: "/admin/add-officer", label: "Add GS / DS", icon: <FaPlusCircle /> },
      { path: "/admin/structure", label: "Admin Structure" , icon: <FaHome /> },
      { path: "/admin/manage-users", label: "Manage Users", icon: <FaUsers /> },
      
    ],
// sidebar GS menu
    gs: [
    { path: "/gs/gs-dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/gs/gs-pendingcauses", label: "Pending Causes", icon: <FaClipboardList /> },
    { path: "/gs/gs-documents", label: "Documents", icon: <FaList /> },
    { path: "/gs/gs-resetpassword", label: "Reset Password", icon: <FaUserShield /> },
  ],

  // ✅ DS MENU (optional but recommended)
    ds: [
    { path: "/ds-dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/ds/pending-causes", label: "Pending Causes", icon: <FaClipboardList /> },
    { path: "/ds/documents", label: "Documents", icon: <FaList /> },
    { path: "/ds/reset-password", label: "Reset Password", icon: <FaUserShield /> },
  ],

  };

  const links = menus[role] || [];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-[#0a2e52] flex flex-col justify-between shadow-lg min-h-screen fixed">
      
      {/* Top Logo */}
      <div>
        <div className="p-6 text-center border-b border-gray-700 flex flex-col items-center">
          <img src="/assets/logo.png" alt="DigiBox Logo" className="w-25 h-16 mb-2" />
          <p className="text-gray-300 capitalize font-bold">{role} Panel</p>
        </div>

        {/* Menu Items */}
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
                <span className={`text-lg ${isActive ? "text-white" : "text-[#26bfef]"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
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
