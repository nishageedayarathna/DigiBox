import React from "react";

const StatCard = ({ title, value, color }) => {
  return (
    <div className="bg-[#1F2937] p-6 rounded-xl shadow-md hover:shadow-[#26bfef]/30 transition text-center">
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
};

export default StatCard;
