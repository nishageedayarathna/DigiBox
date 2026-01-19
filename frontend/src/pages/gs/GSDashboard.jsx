import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import { fetchGSDashboard } from "../../services/gsService";

const GSDashboard = () => {
  const [stats, setStats] = useState(null);
  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGSDashboard()
      .then((res) => {
        const data = res.data;

        setStats({
          pending: data.pendingCauses,
          approved: data.approvedCauses,
          rejected: data.rejectedCauses,
        });

        setArea({
          district: data.welcomeInfo.gsOfficer.district,
          division: data.welcomeInfo.gsOfficer.division,
          gnArea: data.welcomeInfo.gsOfficer.area,
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-white p-8">Loading...</p>;

  return (
    <div className="bg-[#111827] min-h-screen text-white flex">
      <Sidebar role="gs" />

      <main className="flex-1 p-8 md:ml-64">
        <h1 className="text-2xl font-bold text-[#26bfef] mb-6">
          GS Officer Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard title="Pending Causes" value={stats.pending} />
          <StatCard title="Approved Causes" value={stats.approved} />
          <StatCard title="Rejected Causes" value={stats.rejected} />
        </div>

        {/* Area */}
        <div className="bg-[#1F2937] p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-[#26bfef] mb-4">
            Assigned Area
          </h2>
          <p>District: {area.district}</p>
          <p>Division: {area.division}</p>
          <p>GN Area: {area.gnArea}</p>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="bg-[#1F2937] p-5 rounded-xl text-center">
    <p className="text-gray-400">{title}</p>
    <h3 className="text-2xl font-bold text-[#26bfef]">{value}</h3>
  </div>
);

export default GSDashboard;
