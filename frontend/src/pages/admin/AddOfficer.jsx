import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";
import FormInput from "../../components/FormInput";

const AddOfficer = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "gs",
    districtCode: "",
    districtName: "",
    divisionCode: "",
    divisionName: "",
    areaCode: "",
    areaName: "",
  });

  const token = localStorage.getItem("token");

  const submit = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!form.username || !form.email) return alert("Fill username and email");
    if (!form.districtCode || !form.districtName)
      return alert("Fill district code and name");
    if (!form.divisionCode || !form.divisionName)
      return alert("Fill division code and name");
    if (form.role === "gs" && (!form.areaCode || !form.areaName))
      return alert("Fill area code and name for GS");

    try {
      const endpoint =
        form.role === "ds"
          ? "http://localhost:5000/api/admin/add-ds"
          : "http://localhost:5000/api/admin/add-gs";

      const payload =
        form.role === "ds"
          ? {
              username: form.username,
              email: form.email,
              districtCode: form.districtCode,
              districtName: form.districtName,
              divisionCode: form.divisionCode,
              divisionName: form.divisionName,
            }
          : {
              username: form.username,
              email: form.email,
              districtCode: form.districtCode,
              districtName: form.districtName,
              divisionCode: form.divisionCode,
              divisionName: form.divisionName,
              areaCode: form.areaCode,
              areaName: form.areaName,
            };

      const res = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data.message);

      // Reset form
      setForm({
        username: "",
        email: "",
        role: "gs",
        districtCode: "",
        districtName: "",
        divisionCode: "",
        divisionName: "",
        areaCode: "",
        areaName: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error adding officer");
    }
  };

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="admin" />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-2xl mb-6">Add GS / DS Officer</h1>

        <form
          onSubmit={submit}
          className="bg-[#1F2937] p-6 rounded w-96 space-y-3"
        >
          <FormInput
            label="Username"
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <FormInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="gs">GS</option>
              <option value="ds">DS</option>
            </select>
          </div>

          {/* District */}
          <FormInput
            label="District Code"
            type="text"
            value={form.districtCode}
            onChange={(e) => setForm({ ...form, districtCode: e.target.value })}
          />
          <FormInput
            label="District Name"
            type="text"
            value={form.districtName}
            onChange={(e) => setForm({ ...form, districtName: e.target.value })}
          />

          {/* Division */}
          <FormInput
            label="Division Code"
            type="text"
            value={form.divisionCode}
            onChange={(e) => setForm({ ...form, divisionCode: e.target.value })}
          />
          <FormInput
            label="Division Name"
            type="text"
            value={form.divisionName}
            onChange={(e) => setForm({ ...form, divisionName: e.target.value })}
          />

          {/* Area only for GS */}
          {form.role === "gs" && (
            <>
              <FormInput
                label="Area Code"
                type="text"
                value={form.areaCode}
                onChange={(e) => setForm({ ...form, areaCode: e.target.value })}
              />
              <FormInput
                label="Area Name"
                type="text"
                value={form.areaName}
                onChange={(e) => setForm({ ...form, areaName: e.target.value })}
              />
            </>
          )}

          <button
            type="submit"
            className="bg-[#26bfef] px-4 py-2 rounded w-full"
          >
            Add Officer
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddOfficer;
