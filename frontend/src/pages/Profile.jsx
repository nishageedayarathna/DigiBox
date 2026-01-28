import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaCamera, FaSave, FaLock } from "react-icons/fa";
import Sidebar from "../components/dashboard/Sidebar";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
    profileImage: "",
    districtCode: "",
    districtName: "",
    divisionCode: "",
    divisionName: "",
    areaCode: "",
    areaName: "",
    createdAt: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setProfile(res.data.user);
        setFormData({
          username: res.data.user.username,
          email: res.data.user.email,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select a valid image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(
          "http://localhost:5000/api/profile/upload-image",
          { profileImage: reader.result },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setProfile({ ...profile, profileImage: res.data.profileImage });
          setMessage({ type: "success", text: "Profile image updated successfully" });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setMessage({ type: "error", text: error.response?.data?.message || "Failed to upload image" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/profile",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setProfile({ ...profile, ...res.data.user });
        setEditMode(false);
        setMessage({ type: "success", text: "Profile updated successfully" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to update profile" 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "http://localhost:5000/api/profile/reset-password",
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage({ type: "success", text: "Password updated successfully" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to reset password" 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        {profile.role && <Sidebar role={profile.role} />}
        <div className="flex-1 flex justify-center items-center h-screen">
          <div className="text-xl text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      {/* Sidebar */}
      <Sidebar role={profile.role} />

      {/* Main Content */}
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-[#1e293b] rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">My Profile</h1>
          <p className="text-gray-400">Manage your account settings and personal information</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success" ? "bg-green-200 text-green-900" : "bg-red-200 text-red-900"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Image Section */}
        <div className="bg-[#1e293b] rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#f1f5f9] mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#3b82f6]"
                />
              ) : (
                <FaUserCircle className="w-32 h-32 text-gray-400" />
              )}
              <label
                htmlFor="profileImageUpload"
                className="absolute bottom-0 right-0 bg-[#3b82f6] text-white p-2 rounded-full cursor-pointer hover:bg-[#2563eb] transition"
              >
                <FaCamera />
              </label>
              <input
                type="file"
                id="profileImageUpload"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-gray-400 mb-2">Upload a new profile picture</p>
              <p className="text-sm text-gray-500">JPG, PNG or GIF (max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-[#1e293b] rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#f1f5f9]">Basic Information</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:outline-none bg-[#0f172a] text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:outline-none bg-[#0f172a] text-white"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({ username: profile.username, email: profile.email });
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Username</label>
                <p className="text-white font-medium">{profile.username}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email</label>
                <p className="text-white font-medium">{profile.email}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Role</label>
                <p className="text-white font-medium capitalize">{profile.role}</p>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Member Since</label>
                <p className="text-white font-medium">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Administrative Information (for GS/DS) */}
        {(profile.role === "gs" || profile.role === "ds") && (
          <div className="bg-[#1e293b] rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-[#f1f5f9] mb-4">Administrative Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {profile.districtCode && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">District</label>
                  <p className="text-white font-medium">
                    {profile.districtName} ({profile.districtCode})
                  </p>
                </div>
              )}
              {profile.divisionCode && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Division</label>
                  <p className="text-white font-medium">
                    {profile.divisionName} ({profile.divisionCode})
                  </p>
                </div>
              )}
              {profile.areaCode && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Area</label>
                  <p className="text-white font-medium">
                    {profile.areaName} ({profile.areaCode})
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Password Reset Section */}
        <div className="bg-[#1e293b] rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#f1f5f9]">Security</h2>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <FaLock />
                Reset Password
              </button>
            )}
          </div>

          {showPasswordForm ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-gray-300 font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:outline-none bg-[#0f172a] text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:outline-none bg-[#0f172a] text-white"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#3b82f6] focus:outline-none bg-[#0f172a] text-white"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  <FaSave />
                  {saving ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-400">
              Click "Reset Password" to change your account password. Make sure to use a strong
              password that includes letters, numbers, and special characters.
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
