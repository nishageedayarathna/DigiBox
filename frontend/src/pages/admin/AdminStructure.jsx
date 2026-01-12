import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../../components/dashboard/Sidebar";

const AdminStructure = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState(""); // for search input
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/admin-structure", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Structure error:", err));
  }, []);

  // Filter districts and divisions by search input
  const filteredData = data
    .map((district) => {
      const filteredDivisions = Object.values(district.divisions).filter(
        (division) =>
          division.divisionName.toLowerCase().includes(filter.toLowerCase()) ||
          district.districtName.toLowerCase().includes(filter.toLowerCase())
      );
      return { ...district, divisions: filteredDivisions };
    })
    .filter((district) => district.divisions.length > 0); // remove districts with no matching divisions

  return (
    <div className="flex bg-[#111827] min-h-screen text-white">
      <Sidebar role="admin" />

      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-[#26bfef] mb-6">
          Administrative Structure
        </h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by district or division..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-3 w-full rounded bg-[#1F2937] border border-gray-600 text-white focus:outline-none focus:border-[#26bfef]"
          />
        </div>

        {filteredData.length === 0 && (
          <p className="text-gray-400">No districts/divisions match your search.</p>
        )}

        {filteredData.map((district) => (
          <div
            key={district.districtCode}
            className="bg-[#1F2937] p-6 mb-6 rounded-xl"
          >
            <h2 className="text-2xl font-semibold text-[#26bfef] mb-4">
              District: {district.districtName} ({district.districtCode})
            </h2>

            {Object.values(district.divisions).map((division) => (
              <div
                key={division.divisionCode}
                className="border border-gray-600 rounded-lg p-4 mb-4"
              >
                <h3 className="text-xl font-semibold mb-2">
                  Division: {division.divisionName} ({division.divisionCode})
                </h3>

                <p className="mb-2">
                  <strong>DS Officer:</strong>{" "}
                  {division.dsOfficer
                    ? `${division.dsOfficer.username} (${division.dsOfficer.email})`
                    : "Not assigned"}
                </p>

                <div className="mt-3">
                  <h4 className="font-semibold mb-2">GS Areas</h4>

                  {division.gsAreas.length === 0 && (
                    <p className="text-gray-400">No GS areas added</p>
                  )}

                  {division.gsAreas.map((gs) => (
                    <div
                      key={gs.areaCode}
                      className="ml-4 mb-2 p-3 bg-[#111827] rounded"
                    >
                      <p>
                        <strong>{gs.areaName}</strong> ({gs.areaCode})
                      </p>
                      <p className="text-sm text-gray-300">
                        GS Officer: {gs.gsOfficer.username} (
                        {gs.gsOfficer.email})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
};

export default AdminStructure;
