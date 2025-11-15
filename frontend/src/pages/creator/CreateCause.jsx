import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

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

  const [evidence, setEvidence] = useState(null);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setEvidence(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    // --- Match backend field names ---
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("requiredAmount", formData.requiredAmount);

    form.append("beneficiaryName", formData.beneficiaryName);
    form.append("beneficiaryContact", formData.beneficiaryContact);

    form.append("beneficiaryAccountName", formData.beneficiaryAccountName);
    form.append("beneficiaryBank", formData.beneficiaryBank);
    form.append("beneficiaryAccountNumber", formData.beneficiaryAccountNumber);
    form.append("beneficiaryBranch", formData.beneficiaryBranch);

    form.append("evidenceFile", evidence); // correct

    try {
      const res = await axios.post(
        "http://localhost:5000/api/cause/create",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(res.data);
      alert("Cause submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error submitting cause");
    }
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="creator" />

      <main className="flex-1 ml-0 md:ml-64 p-8">
        <h1 className="text-3xl font-bold text-center text-[#26bfef] mb-8">
          Create New Cause
        </h1>

        <div className="bg-[#1F2937] p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
          {msg && <p className="mb-4 text-center text-[#26bfef]">{msg}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block mb-2">Cause Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
            </div>

            {/* Required Amount */}
            <div>
              <label className="block mb-2">Required Amount (LKR)</label>
              <input
                type="number"
                name="requiredAmount"
                value={formData.requiredAmount}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
            </div>

            {/* Beneficiary Details */}
            <h2 className="text-lg font-semibold text-[#26bfef]">
              Beneficiary Details
            </h2>

            <div>
              <label className="block mb-2">Beneficiary Name</label>
              <input
                name="beneficiaryName"
                value={formData.beneficiaryName}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-2">Beneficiary Contact</label>
              <input
                name="beneficiaryContact"
                value={formData.beneficiaryContact}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
            </div>

            {/* Bank Details */}
            <h2 className="text-lg font-semibold text-[#26bfef]">
              Beneficiary Bank Details
            </h2>

            <div>
              <label className="block mb-2">Account Holder Name</label>
              <input
                name="beneficiaryAccountName"
                value={formData.beneficiaryAccountName}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-2">Bank Name</label>
              <input
                name="beneficiaryBank"
                value={formData.beneficiaryBank}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-2">Account Number</label>
              <input
                name="beneficiaryAccountNumber"
                value={formData.beneficiaryAccountNumber}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
            </div>

            <div>
              <label className="block mb-2">Branch</label>
              <input
                name="beneficiaryBranch"
                value={formData.beneficiaryBranch}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg"
              />
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block mb-2">Upload Evidence (PDF / Image)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                className="block w-full text-gray-300 file:bg-[#26bfef] file:text-white file:py-2 file:px-4 file:rounded-lg"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#26bfef] hover:bg-[#0a6c8b] font-semibold"
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
