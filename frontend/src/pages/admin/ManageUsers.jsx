import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";
import { FaSearch, FaTrash, FaFilter } from "react-icons/fa";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Fetch users when page loads
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load users");
    }
  };

  // Search filter
  useEffect(() => {
    let data = [...users];

    if (search.trim() !== "") {
      data = data.filter((u) =>
        u.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      data = data.filter((u) => u.role === roleFilter);
    }

    setFiltered(data);
  }, [search, roleFilter, users]);

  // Delete user (you can change action later)
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("User deleted");
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="admin" />

      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-3xl font-bold text-[#26bfef] mb-8">
          Manage Users
        </h1>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          {/* Search bar */}
          <div className="flex items-center bg-[#1F2937] p-3 rounded-lg w-full md:w-1/2 gap-3">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent flex-1 outline-none text-white"
            />
          </div>

          {/* Role filter */}
          <div className="flex items-center bg-[#1F2937] p-3 rounded-lg gap-3">
            <FaFilter className="text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-white outline-none"
            >
              <option value="all">All Roles</option>
              <option value="creator">Creators</option>
              <option value="donor">Donors</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#1F2937] p-6 rounded-2xl shadow-lg overflow-x-auto">
          <table className="w-full table-auto text-left">
            <thead>
              <tr className="text-[#26bfef] border-b border-gray-700">
                <th className="p-3">Username</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Created At</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-700 hover:bg-[#0a6c8b]/20 transition"
                  >
                    <td className="p-3">{user.username}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 capitalize">{user.role}</td>
                    <td className="p-3">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-500 hover:text-red-300"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-gray-400 text-center" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;
