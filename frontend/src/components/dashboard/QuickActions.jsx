import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlusCircle, FaListAlt, FaChartBar } from "react-icons/fa";

const QuickActions = ({ role = "creator", onViewChange }) => {
  const navigate = useNavigate();

  // 🔹 Role-based actions
  const actions = {
    creator: [
      {
        icon: <FaPlusCircle size={28} />,
        title: "Create New Cause",
        onClick: () => navigate("/creator/create-cause"),
      },
      {
        icon: <FaListAlt size={28} />,
        title: "View My Causes",
        onClick: () => navigate("/creator/causes"),
      },
      {
        icon: <FaChartBar size={28} />,
        title: "View Analytics",
        onClick: () => onViewChange?.("analytics"), // 🔸 trigger view change instead of navigate
      },
    ],
    donor: [
      {
        icon: <FaListAlt size={28} />,
        title: "View Donations",
        onClick: () => navigate("/donations"),
      },
      {
        icon: <FaChartBar size={28} />,
        title: "Donation Analytics",
        onClick: () => navigate("/donor-analytics"),
      },
    ],
    admin: [
      {
        icon: <FaListAlt size={28} />,
        title: "Manage Users",
        onClick: () => navigate("/admin/users"),
      },
      {
        icon: <FaChartBar size={28} />,
        title: "System Reports",
        onClick: () => navigate("/admin/reports"),
      },
    ],
  };

  return (
    <div className="bg-[#1F2937] p-6 rounded-2xl shadow-md mt-8">
      <h2 className="text-xl font-semibold mb-5 text-[#26bfef]">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
        {actions[role].map((action, index) => (
          <div
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center bg-[#111827] p-5 rounded-xl hover:bg-[#0a6c8b]/30 transition cursor-pointer shadow-md hover:shadow-lg"
          >
            <div className="text-[#26bfef] mb-3">{action.icon}</div>
            <p className="text-sm font-medium text-center">{action.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
