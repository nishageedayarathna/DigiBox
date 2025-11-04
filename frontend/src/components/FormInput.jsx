// src/components/FormInput.jsx
import React from "react";

const FormInput = ({ label, type, name, value, onChange, required = true }) => {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#26bfef]"
      />
    </div>
  );
};

export default FormInput;
