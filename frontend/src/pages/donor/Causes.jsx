import React, { useEffect, useState } from "react";
import Sidebar from "../../components/dashboard/Sidebar";
import axios from "axios";
import { Link } from "react-router-dom";

// Category to image mapping
const getCategoryImage = (category) => {
  const categoryImages = {
    Health: "/assets/images/health.jpg",
    Education: "/assets/images/education.jpg",
    Disaster: "/assets/images/disaster.jpg",
    Poverty: "/assets/images/poverty.jpg",
    Environment: "/assets/images/environment.jpg",
    Other: "/assets/images/default.jpg"
  };
  return categoryImages[category] || categoryImages.Other;
};

const Causes = () => {
  const [causes, setCauses] = useState([]);

  useEffect(() => {
    const fetchCauses = async () => {
      const res = await axios.get("/api/donor/causes", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCauses(res.data);
    };

    fetchCauses();
  }, []);

  return (
    <div className="bg-[#111827] min-h-screen flex text-white">
      <Sidebar role="donor" />

      <main className="flex-1 ml-64 p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">
          Available Causes
        </h1>

        <div className="grid md:grid-cols-3 gap-6">
          {causes.map((cause) => (
            <div key={cause._id} className="bg-[#1F2937] p-4 rounded-xl">
              <img
                src={cause.image || getCategoryImage(cause.category)}
                alt={cause.title}
                className="h-40 w-full object-cover rounded mb-3"
                onError={(e) => {
                  e.target.src = "/assets/images/default.jpg";
                }}
              />
              <h2 className="font-semibold">{cause.title}</h2>
              <p className="text-sm text-gray-400">{cause.category}</p>

              <Link
                to={`/donor/causes/${cause._id}`}
                className="inline-block mt-3 text-primary"
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Causes;