// Login.jsx
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormCard from "../components/FormCard";
import SubmitButton from "../components/SubmitButton";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess("Login successful!");
const role = res.data.user.role;
      // ✅ Redirect based on role
      setTimeout(() => {
        if (user.role === "creator") navigate("/creator/creator-dashboard");
        else if (user.role === "admin") navigate("/admin/admin-dashboard");
        else if(user.role === "gs") navigate("/gs/gs-dashboard");
        else if(user.role === "ds") navigate("/ds/ds-dashboard");
        else navigate("/");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow px-6 py-10">
      <FormCard title="Welcome Back">
        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {success && <p className="text-green-500 text-center mb-3">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <SubmitButton label="Login" />
        </form>

        <p className="text-center text-gray-400 mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-[#26bfef] hover:underline">
            Sign Up
          </Link>
        </p>
      </FormCard>
    </div>
  );
};

export default Login;
