import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import FormInput from "../components/FormInput";
import FormCard from "../components/FormCard";
import SubmitButton from "../components/SubmitButton";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setSuccess("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow px-6 py-10">
      <FormCard title="Forgot Password">
        <p className="text-gray-400 text-center mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {success && <p className="text-green-500 text-center mb-3">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required={true}
          />

          <SubmitButton label={loading ? "Sending..." : "Send Reset Link"} disabled={loading} />
        </form>

        <p className="text-center text-gray-400 mt-4">
          Remember your password?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </p>
      </FormCard>
    </div>
  );
};

export default ForgotPassword;