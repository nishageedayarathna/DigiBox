// src/components/SubmitButton.jsx
import React from "react";

const SubmitButton = ({ label }) => {
  return (
    <button
      type="submit"
      className="w-full py-3 bg-[#26bfef] hover:bg-[#0a6c8b] rounded-lg font-semibold transition"
    >
      {label}
    </button>
  );
};

export default SubmitButton;
