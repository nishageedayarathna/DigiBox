// CreateCause.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

const CreateCause = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
    areaCode: "",
  });

  const [errors, setErrors] = useState({});
  const [evidence, setEvidence] = useState(null);
  const [hierarchy, setHierarchy] = useState({});
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

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
    requiredAmount: (v) =>
      v >= 1000 ? "" : "Required amount must be at least LKR 1,000.",
    beneficiaryName: (v) =>
      v.length >= 3 ? "" : "Name must be at least 3 characters.",
    beneficiaryContact: (v) =>
      /^07\d{8}$/.test(v) ? "" : "Enter a valid Sri Lankan number.",
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

    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({ ...p, evidence: "Only PDF, JPG, PNG allowed." }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, evidence: "File must be under 5MB." }));
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
      return alert("Fix all errors before submitting.");
    }

    const data = new FormData();
    Object.entries(formData).forEach(([k, v]) => data.append(k, v));
    data.append("evidenceFile", evidence);

    try {
      await axios.post("http://localhost:5000/api/cause/create", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Cause submitted successfully!");

      // Reset form
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
        areaCode: "",
      });
      setEvidence(null);
      setErrors({});
      setSelectedDistrict("");
      setSelectedDivision("");
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting cause");
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
        <h1 className="text-3xl font-bold text-[#26bfef] mb-8 text-center">
          Create New Cause
        </h1>

        <div className="bg-[#1F2937] p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
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

            {/* CASCADING DROPDOWNS */}
            <h2 className="text-xl font-bold text-[#26bfef] pt-4">Select Area</h2>

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
            <h2 className="text-xl font-bold text-[#26bfef] pt-4">
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

            {/* FILE */}
            <div>
              <label>Upload Evidence</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange} />
              {renderError(errors.evidence)}
            </div>

            <button className="w-full py-3 bg-[#26bfef] rounded-lg font-semibold hover:bg-[#0a6c8b]">
              Submit Cause
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateCause;
