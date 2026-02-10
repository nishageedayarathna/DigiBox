import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";
import AlertModal from "../../components/AlertModal";
import LoadingSpinner from "../../components/LoadingSpinner";
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

  const [alert, setAlert] = useState({ isOpen: false, message: "", type: "info" });
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  const submit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email)
      return setAlert({ isOpen: true, message: "Fill username and email", type: "warning" });
    if (!form.districtCode || !form.districtName)
      return setAlert({ isOpen: true, message: "Fill district code and name", type: "warning" });
    if (!form.divisionCode || !form.divisionName)
      return setAlert({ isOpen: true, message: "Fill division code and name", type: "warning" });
    if (form.role === "gs" && (!form.areaCode || !form.areaName))
      return setAlert({ isOpen: true, message: "Fill area code and name for GS", type: "warning" });

    setLoading(true);
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

      setAlert({ isOpen: true, message: res.data.message, type: "success" });

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
      setAlert({ isOpen: true, message: err.response?.data?.message || "Error adding officer", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="admin" />

      {/* MAIN AREA */}
      <main className="flex-1 md:ml-64 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#1F2937] rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-semibold text-center text-primary mb-6">
            Add GS / DS Officer
          </h1>

          <form onSubmit={submit} className="space-y-4">
            <FormInput
              label="Username"
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />

            <FormInput
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            {/* Role */}
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Role
              </label>
              <select
                className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="gs">GS Officer</option>
                <option value="ds">DS Officer</option>
              </select>
            </div>

            {/* District */}
            <FormInput
              label="District Code"
              type="text"
              value={form.districtCode}
              onChange={(e) =>
                setForm({ ...form, districtCode: e.target.value })
              }
            />
            <FormInput
              label="District Name"
              type="text"
              value={form.districtName}
              onChange={(e) =>
                setForm({ ...form, districtName: e.target.value })
              }
            />

            {/* Division */}
            <FormInput
              label="Division Code"
              type="text"
              value={form.divisionCode}
              onChange={(e) =>
                setForm({ ...form, divisionCode: e.target.value })
              }
            />
            <FormInput
              label="Division Name"
              type="text"
              value={form.divisionName}
              onChange={(e) =>
                setForm({ ...form, divisionName: e.target.value })
              }
            />

            {/* GS only */}
            {form.role === "gs" && (
              <>
                <FormInput
                  label="Area Code"
                  type="text"
                  value={form.areaCode}
                  onChange={(e) =>
                    setForm({ ...form, areaCode: e.target.value })
                  }
                />
                <FormInput
                  label="Area Name"
                  type="text"
                  value={form.areaName}
                  onChange={(e) =>
                    setForm({ ...form, areaName: e.target.value })
                  }
                />
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-secondary transition text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding officer...
                </span>
              ) : (
                "Add Officer"
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

export default AddOfficer;
