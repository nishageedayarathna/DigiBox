import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // fixed here
  const token = localStorage.getItem("token");

  // Fetch all users
  const fetchUsers = async () => {
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to fetch users from server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Delete user
  const removeUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u._id !== id));
      setError("");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to delete the user."
      );
    }
  };

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="admin" />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-2xl mb-6">Manage Users</h1>

        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-400 mb-4">{error}</p>}

        {!loading && users.length === 0 && <p>No users found.</p>}

        {users.map((u) => (
          <div
            key={u._id}
            className="bg-[#1F2937] p-4 mb-3 rounded flex justify-between items-center"
          >
            <span>
              {u.username} ({u.role})
            </span>
            <button
              onClick={() => removeUser(u._id)}
              className="text-red-400 hover:text-red-600 transition"
            >
              Delete
            </button>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ManageUsers;
