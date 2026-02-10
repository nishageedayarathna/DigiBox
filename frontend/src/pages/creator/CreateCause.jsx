// CreateCause.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";
import AlertModal from "../../components/AlertModal";

const CreateCause = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    requiredAmount: "",
    beneficiaryName: "",
    beneficiaryContact: "",
    beneficiaryAddress: "",
    beneficiaryNIC: "",
    beneficiaryAccountName: "",
    beneficiaryBank: "",
    beneficiaryAccountNumber: "",
    beneficiaryBranch: "",
    areaCode: "",
  });

  const [errors, setErrors] = useState({});
  const [evidence, setEvidence] = useState(null);
  const [hierarchy, setHierarchy] = useState({});
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("");

  // =========================
  // FETCH GS HIERARCHY
  // =========================
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHierarchy = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/admin/gs-hierarchy",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHierarchy(res.data || {});
      } catch (err) {
        console.error("Failed to fetch GS hierarchy:", err);
      } finally {
        setLoadingHierarchy(false);
      }
    };

    fetchHierarchy();
  }, [token, navigate]);

  // =========================
  // VALIDATIONS
  // =========================
  const validators = {
    title: (v) => (v.length >= 10 ? "" : "Title must be at least 10 characters."),
    description: (v) =>
      v.length >= 30 ? "" : "Description must be at least 30 characters.",
    category: (v) => (v ? "" : "Please select a category."),
    requiredAmount: (v) =>
      v >= 1000 ? "" : "Required amount must be at least LKR 1,000.",
    beneficiaryName: (v) =>
      v.length >= 3 ? "" : "Name must be at least 3 characters.",
    beneficiaryContact: (v) =>
      /^07\d{8}$/.test(v) ? "" : "Enter a valid Sri Lankan number.",
    beneficiaryAddress: (v) =>
      v.length >= 10 ? "" : "Address must be at least 10 characters.",
    beneficiaryNIC: (v) =>
      /^\d{12}$/.test(v) || /^\d{9}[VvXx]$/.test(v) ? "" : "Enter a valid NIC (12 digits or 9 digits + V/X).",
    beneficiaryAccountName: (v) =>
      v.length >= 3 ? "" : "Account name must be at least 3 characters.",
    beneficiaryBank: (v) =>
      v.length >= 3 ? "" : "Bank name must be at least 3 characters.",
    beneficiaryAccountNumber: (v) =>
      /^\d{6,20}$/.test(v) ? "" : "Account number must be 6–20 digits.",
    beneficiaryBranch: (v) =>
      v.length >= 2 ? "" : "Branch must be at least 2 characters.",
    areaCode: (v) => (v ? "" : "Please select an area code."),
  };

  // =========================
  // INPUT HANDLERS
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (validators[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validators[name](value),
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ["application/pdf"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({ ...p, evidence: "Only PDF files are allowed. Please combine all documents into a single PDF." }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((p) => ({ ...p, evidence: "File must be under 2MB. Please compress your PDF." }));
      return;
    }

    setErrors((p) => ({ ...p, evidence: "" }));
    setEvidence(file);
  };

  // =========================
  // SUBMIT FORM
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

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
      return setAlert({ isOpen: true, message: "Fix all errors before submitting.", type: "warning" });
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append("evidenceFile", evidence);

    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:5000/api/cause/create", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Show success message and reset form completely
      setSuccessMessage("✅ Cause submitted successfully! Form is ready for your next cause.");

      // Reset form completely for new cause creation
      setFormData({
        title: "",
        description: "",
        category: "",
        requiredAmount: "",
        beneficiaryName: "",
        beneficiaryContact: "",
        beneficiaryAddress: "",
        beneficiaryAccountName: "",
        beneficiaryBank: "",
        beneficiaryAccountNumber: "",
        beneficiaryBranch: "",
        areaCode: "",
      });
      setEvidence(null);
      setErrors({});
      setSelectedDistrict("");
      setSelectedDivision("");

      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Error submitting cause";
      console.error("Submission error:", err);
      setAlert({ isOpen: true, message: `❌ Error: ${errorMsg}`, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (msg) =>
    msg && <p className="text-red-400 text-sm mt-1">{msg}</p>;

  // =========================
  // UI
  // =========================
  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="creator" />

      <main className="flex-1 ml-0 md:ml-64 p-8">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">
          Create New Cause
        </h1>

        <div className="bg-[#1F2937] p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-600 text-white rounded-lg text-center font-semibold">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* TITLE */}
            <div>
              <label>Cause Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.title)}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label>Description</label>
              <textarea
                rows="3"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.description)}
            </div>

            {/* CATEGORY */}
            <div>
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              >
                <option value="">Select a category</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Disaster">Disaster</option>
                <option value="Poverty">Poverty</option>
                <option value="Environment">Environment</option>
                <option value="Other">Other</option>
              </select>
              {renderError(errors.category)}
            </div>

            {/* AMOUNT */}
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

            {/* BENEFICIARY */}
            <div>
              <label>Beneficiary Name</label>
              <input
                name="beneficiaryName"
                value={formData.beneficiaryName}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryName)}
            </div>

            <div>
              <label>Beneficiary Contact</label>
              <input
                name="beneficiaryContact"
                value={formData.beneficiaryContact}
                onChange={handleChange}
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryContact)}
            </div>

            <div>
              <label>Beneficiary Address</label>
              <textarea
                name="beneficiaryAddress"
                value={formData.beneficiaryAddress}
                onChange={handleChange}
                rows="3"
                placeholder="Enter full residential address (street, city, postal code)"
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryAddress)}
            </div>

            <div>
              <label>Beneficiary NIC Number</label>
              <input
                name="beneficiaryNIC"
                value={formData.beneficiaryNIC}
                onChange={handleChange}
                placeholder="Enter 12 digits (e.g., 200012345678) or 9 digits + V/X (e.g., 123456789V)"
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
              {renderError(errors.beneficiaryNIC)}
            </div>

            {/* CASCADING DROPDOWNS */}
            <h2 className="text-xl font-bold text-primary pt-4">Select Area</h2>

            {loadingHierarchy ? (
              <p>Loading districts...</p>
            ) : (
              <>
                {/* District */}
                <div>
                  <label>District</label>
                  <select
                    className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedDivision("");
                      setFormData({ ...formData, areaCode: "" });
                    }}
                  >
                    <option value="">Select District</option>
                    {Object.entries(hierarchy).map(([code, data]) => (
                      <option key={code} value={code}>{data.districtName}</option>
                    ))}
                  </select>
                </div>

                {/* Division */}
                {selectedDistrict && (
                  <div>
                    <label>Division</label>
                    <select
                      className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
                      value={selectedDivision}
                      onChange={(e) => {
                        setSelectedDivision(e.target.value);
                        setFormData({ ...formData, areaCode: "" });
                      }}
                    >
                      <option value="">Select Division</option>
                      {Object.entries(hierarchy[selectedDistrict].divisions).map(
                        ([divCode, divData]) => (
                          <option key={divCode} value={divCode}>{divData.divisionName}</option>
                        )
                      )}
                    </select>
                  </div>
                )}

                {/* GS Area */}
                {selectedDivision && (
                  <div>
                    <label>GS Area</label>
                    <select
                      className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
                      value={formData.areaCode}
                      onChange={(e) => setFormData({ ...formData, areaCode: e.target.value })}
                    >
                      <option value="">Select GS Area</option>
                      {hierarchy[selectedDistrict].divisions[selectedDivision].areas.map(a => (
                        <option key={a.areaCode} value={a.areaCode}>{a.areaName}</option>
                      ))}
                    </select>
                    {renderError(errors.areaCode)}
                  </div>
                )}
              </>
            )}

            {/* BANK */}
            <h2 className="text-xl font-bold text-primary pt-4">
              Banking Details
            </h2>

            {["beneficiaryAccountName","beneficiaryBank","beneficiaryAccountNumber","beneficiaryBranch"]
              .map((field) => (
                <div key={field}>
                  <label>{field.replace(/([A-Z])/g, " $1")}</label>
                  <input
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
                  />
                  {renderError(errors[field])}
                </div>
            ))}

            {/* EVIDENCE FILE */}
            <div className="border border-yellow-600 rounded-lg p-4 bg-yellow-900/20">
              <h2 className="text-xl font-bold text-primary mb-3">Upload Evidence Document</h2>
              
              <div className="bg-[#1e293b] border-l-4 border-yellow-500 p-4 mb-4 rounded">
                <p className="text-yellow-400 font-semibold mb-2 flex items-center">
                  <span className="text-2xl mr-2">⚠️</span>
                  IMPORTANT: Required Documents
                </p>
                <p className="text-gray-300 text-sm mb-3">
                  Your evidence file MUST include the following documents combined into a SINGLE PDF:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm ml-4">
                  <li><strong>Both sides of NIC</strong> - Clear photos of front and back of National Identity Card</li>
                  <li><strong>Valid evidence documents</strong> - Medical reports, bills, certificates, or other supporting documents</li>
                  <li><strong>Bank statement</strong> - Front page of the beneficiary's bank book showing account details</li>
                </ul>
                <p className="text-yellow-300 text-xs mt-3 font-medium">
                  📄 Combine all documents into ONE PDF file (max 2MB). Use online PDF tools to merge and compress if needed.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-white font-medium">Select PDF File</label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 hover:border-primary transition text-center">
                      {evidence ? (
                        <div className="space-y-2">
                          <p className="text-green-400 font-medium">✓ File Selected</p>
                          <p className="text-gray-300 text-sm">{evidence.name}</p>
                          <p className="text-gray-400 text-xs">
                            Size: {(evidence.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-4xl">📄</div>
                          <p className="text-gray-300 font-medium">Click to upload PDF</p>
                          <p className="text-gray-500 text-sm">Maximum file size: 2MB</p>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {evidence && (
                    <button
                      type="button"
                      onClick={() => {
                        setEvidence(null);
                        setErrors((p) => ({ ...p, evidence: "" }));
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {renderError(errors.evidence)}
              </div>
            </div>

            <button 
              disabled={isSubmitting}
              className="w-full py-3 bg-primary rounded-lg font-semibold hover:bg-secondary transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </span>
              ) : (
                "Submit Cause"
              )}
            </button>
          </form>
        </div>

        <AlertModal 
          message={alert.message} 
          isOpen={alert.isOpen} 
          onClose={() => setAlert({ ...alert, isOpen: false })} 
          type={alert.type}
        />
      </main>
    </div>
  );
};

export default CreateCause;