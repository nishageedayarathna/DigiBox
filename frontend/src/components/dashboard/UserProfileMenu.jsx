import React, { useState, useEffect } from "react";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";

const UserProfileMenu = () => {
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

  if (!user) return null;

  return (
    <div className="relative">
      {/* Profile Icon */}
      <button onClick={() => setOpen(!open)}>
        <FaUserCircle className="text-3xl text-[#26bfef] hover:text-white" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-[#1F2937] shadow-xl rounded-xl p-4 z-50">
          <p className="font-semibold text-white text-lg">{user.username}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
          <p className="text-xs text-[#26bfef] mt-1 capitalize">
            Role: {user.role}
          </p>

          <hr className="my-3 border-gray-600" />

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
