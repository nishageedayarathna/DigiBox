import React, { useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";

const CreateCause = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    location: "",
    category: "",
  });

  const [evidence, setEvidence] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setEvidence(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Cause Data:", formData);
    console.log("Evidence File:", evidence);
    alert("Cause submitted successfully for admin approval!");
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      {/* Sidebar */}
      <Sidebar role="creator" />

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 p-8 transition-all">
        <h1 className="text-3xl font-bold text-[#26bfef] mb-8"><center>Create New Cause</center></h1>

        <div className="bg-[#1F2937] p-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block mb-2 text-gray-300">Cause Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter cause title"
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:border-[#26bfef] focus:outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-gray-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe the need or purpose of this cause..."
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:border-[#26bfef] focus:outline-none"
              />
            </div>

            {/* Target Amount */}
            <div>
              <label className="block mb-2 text-gray-300">Target Amount (LKR)</label>
              <input
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                required
                placeholder="Enter target amount"
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:border-[#26bfef] focus:outline-none"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block mb-2 text-gray-300">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter city or town"
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:border-[#26bfef] focus:outline-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-2 text-gray-300">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:border-[#26bfef] focus:outline-none"
              >
                <option value="">Select a category</option>
                <option value="education">Education</option>
                <option value="medical">Medical</option>
                <option value="community">Community Project</option>
                <option value="religious">Religious</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block mb-2 text-gray-300">Upload Evidence (PDF / Image)</label>
              <input
                type="file"
                accept=".pdf, .jpg, .jpeg, .png"
                onChange={handleFileChange}
                className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#26bfef] file:text-white hover:file:bg-[#0a6c8b]"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#26bfef] text-white rounded-lg font-semibold hover:bg-[#0a6c8b] transition"
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
