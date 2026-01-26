import React, { useState, useEffect } from "react";
import { FaUserCircle, FaSignOutAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProfileMenu = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch logged-in user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error("Error loading user profile", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleViewProfile = () => {
    setOpen(false);
    // Navigate to role-specific profile page
    const roleProfilePaths = {
      admin: "/admin/profile",
      creator: "/creator/profile",
      donor: "/donor/profile",
      gs: "/gs/profile",
      ds: "/ds/profile",
    };
    navigate(roleProfilePaths[user.role] || "/profile");
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Profile Icon */}
      <button onClick={() => setOpen(!open)}>
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-primary hover:border-white transition"
          />
        ) : (
          <FaUserCircle className="text-3xl text-primary hover:text-white" />
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-[#1F2937] shadow-xl rounded-xl p-4 z-50">
          <p className="font-semibold text-white text-lg">{user.username}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
          <p className="text-xs text-primary mt-1 capitalize">
            Role: {user.role}
          </p>

          <hr className="my-3 border-gray-600" />

          <button
            onClick={handleViewProfile}
            className="flex items-center gap-2 text-primary hover:text-white w-full mb-2"
          >
            <FaUser /> View Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-400 hover:text-red-500 w-full"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
