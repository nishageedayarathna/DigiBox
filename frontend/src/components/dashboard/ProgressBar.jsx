import React from "react";

const ProgressBar = ({ current, target }) => {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="w-full bg-gray-700 rounded-full h-4 mt-2">
      <div
        className="h-4 rounded-full bg-primary transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
      <p className="text-xs text-gray-400 mt-1 text-right">
        {current} / {target}
      </p>
    </div>
  );
};

export default ProgressBar;
