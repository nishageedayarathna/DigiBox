// src/components/SubmitButton.jsx
import React from "react";

const SubmitButton = ({ label }) => {
  return (
    <button
      type="submit"
      className="w-full py-3 bg-primary hover:bg-primary-dark rounded-lg font-semibold transition"
    >
      {label}
    </button>
  );
};

export default SubmitButton;
