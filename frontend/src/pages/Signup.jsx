import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormCard from "../components/FormCard";
import SubmitButton from "../components/SubmitButton";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "donor",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setSuccess("");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/signup", formData);
      setSuccess("Account created successfully!");
      setError("");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
      setSuccess("");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow px-6 py-10">
      <FormCard title="Create Account">
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {success && <p className="text-green-500 text-center mb-3">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput label="Full Name" type="text" name="username" value={formData.username} onChange={handleChange} />
          <FormInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} />
          <FormInput label="Password" type="password" name="password" value={formData.password} onChange={handleChange} />
          <FormInput label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />

          <div>
            <label className="block text-sm mb-1">Select Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-3 bg-[#111827] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#26bfef]"
            >
              <option value="donor">Donor</option>
              <option value="creator">Cause Creator</option>
              
            </select>
          </div>

          <SubmitButton label="Sign Up" />
        </form>

        <p className="text-center text-gray-400 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-[#26bfef] hover:underline">
            Login
          </Link>
        </p>
      </FormCard>
    </div>
  );
};

export default Signup;
