import React from "react";

const AlertModal = ({ message, isOpen, onClose, type = "info" }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      default:
        return "ℹ️";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "border-green-500";
      case "error":
        return "border-red-500";
      case "warning":
        return "border-yellow-500";
      default:
        return "border-blue-500";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-[#1F2937] rounded-lg p-6 max-w-md w-11/12 shadow-xl border ${getColor()}`}>
        <div className="flex items-start gap-4">
          <span className="text-3xl">{getIcon()}</span>
          <div className="flex-1">
            <p className="text-white text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
