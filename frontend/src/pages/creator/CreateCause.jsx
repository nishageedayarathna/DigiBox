import React, { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";

const CreateCause = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredAmount: "",
    beneficiaryName: "",
    beneficiaryContact: "",
    beneficiaryAccountName: "",
    beneficiaryBank: "",
    beneficiaryAccountNumber: "",
    beneficiaryBranch: "",
  });

  const [errors, setErrors] = useState({});
  const [evidence, setEvidence] = useState(null);

  // ---------------- Validation Rules ----------------
  const validators = {
    title: (v) =>
      v.length >= 10 ? "" : "Title must be at least 10 characters.",
    description: (v) =>
      v.length >= 30 ? "" : "Description must be at least 30 characters.",
    requiredAmount: (v) =>
      v >= 1000 ? "" : "Required amount must be at least LKR 1,000.",
    beneficiaryName: (v) =>
      v.length >= 3 ? "" : "Name must be at least 3 characters.",
    beneficiaryContact: (v) =>
      /^07\d{8}$/.test(v)
        ? ""
        : "Enter a valid Sri Lankan mobile number (07XXXXXXXX).",
    beneficiaryAccountName: (v) =>
      v.length >= 3 ? "" : "Account name must be at least 3 characters.",
    beneficiaryBank: (v) =>
      v.length >= 3 ? "" : "Bank name must be at least 3 characters.",
    beneficiaryAccountNumber: (v) =>
      /^\d{6,20}$/.test(v)
        ? ""
        : "Account number must be 6–20 digits.",
    beneficiaryBranch: (v) =>
      v.length >= 2 ? "" : "Branch must be at least 2 characters.",
  };

  // ---------------- Input Change Handler ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (validators[name]) {
      const errorMsg = validators[name](value);
      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
    }
  };

  // ---------------- File Upload Validation ----------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["application/pdf", "image/jpeg", "image/png"];

    if (!allowed.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        evidence: "Only PDF, JPG, and PNG allowed.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        evidence: "File must be smaller than 5MB.",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, evidence: "" }));
    setEvidence(file);
  };

  // ---------------- Submit Handler ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submitting
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (validators[key]) {
        const msg = validators[key](formData[key]);
        if (msg) newErrors[key] = msg;
      }
    });

    if (!evidence) newErrors.evidence = "Evidence file is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return alert("Please fix all errors before submitting.");
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("evidenceFile", evidence);

    try {
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:5000/api/cause/create", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Cause submitted successfully!");

      setFormData({
        title: "",
        description: "",
        requiredAmount: "",
        beneficiaryName: "",
        beneficiaryContact: "",
        beneficiaryAccountName: "",
        beneficiaryBank: "",
        beneficiaryAccountNumber: "",
        beneficiaryBranch: "",
      });
      setEvidence(null);
      setErrors({});
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting cause");
    }
  };

  const renderError = (msg) =>
    msg && <p className="text-red-400 text-sm mt-1">{msg}</p>;

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="creator" />

      <main className="flex-1 ml-0 md:ml-64 p-8">
        <h1 className="text-3xl font-bold text-[#26bfef] mb-8 text-center">
          Create New Cause
        </h1>

        <div className="bg-[#1F2937] p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label>Cause Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.title)}
            </div>

            {/* Description */}
            <div>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              ></textarea>
              {renderError(errors.description)}
            </div>

            {/* Required Amount */}
            <div>
              <label>Required Amount (LKR)</label>
              <input
                type="number"
                name="requiredAmount"
                value={formData.requiredAmount}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.requiredAmount)}
            </div>

            {/* Beneficiary Name */}
            <div>
              <label>Beneficiary Name</label>
              <input
                type="text"
                name="beneficiaryName"
                value={formData.beneficiaryName}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryName)}
            </div>

            {/* Beneficiary Contact */}
            <div>
              <label>Beneficiary Contact</label>
              <input
                type="text"
                name="beneficiaryContact"
                value={formData.beneficiaryContact}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryContact)}
            </div>

            {/* Banking Details */}
            <h2 className="text-xl font-bold text-[#26bfef] pt-4">
              Banking Details
            </h2>

            {/* Account Name */}
            <div>
              <label>Account Name</label>
              <input
                type="text"
                name="beneficiaryAccountName"
                value={formData.beneficiaryAccountName}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryAccountName)}
            </div>

            {/* Bank */}
            <div>
              <label>Bank</label>
              <input
                type="text"
                name="beneficiaryBank"
                value={formData.beneficiaryBank}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryBank)}
            </div>

            {/* Account Number */}
            <div>
              <label>Account Number</label>
              <input
                type="text"
                name="beneficiaryAccountNumber"
                value={formData.beneficiaryAccountNumber}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryAccountNumber)}
            </div>

            {/* Branch */}
            <div>
              <label>Branch</label>
              <input
                type="text"
                name="beneficiaryBranch"
                value={formData.beneficiaryBranch}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryBranch)}
            </div>

            {/* Evidence */}
            <div>
              <label>Upload Evidence (PDF / Image)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="block w-full"
              />
              {renderError(errors.evidence)}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-[#26bfef] text-white rounded-lg font-semibold hover:bg-[#0a6c8b]"
            >
              Submit Cause
            </button>

          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateCause;
