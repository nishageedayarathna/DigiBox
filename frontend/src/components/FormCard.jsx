// src/components/FormCard.jsx
import React from "react";

const FormCard = ({ title, children }) => {
  return (
    <div className="bg-[#1F2937] p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-center text-[#26bfef] mb-6">{title}</h2>
      {children}
    </div>
  );
};

export default FormCard;
