// components/AnalyticsCard.jsx
import React from "react";

const AnalyticsCard = ({ title, value, subtext, icon }) => {
  return (
    <div className="bg-[#111] p-6 rounded-xl shadow-md flex flex-col gap-2">
      <div className="text-gray-400 text-sm">{title}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-gray-500 text-sm">{subtext}</div>
    </div>
  );
};

export default AnalyticsCard;
