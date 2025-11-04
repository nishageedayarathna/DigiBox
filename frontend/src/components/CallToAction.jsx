import React from "react";
import { Link } from "react-router-dom";

const CallToAction = () => {
  return (
    <section className="py-16 text-center bg-gradient-to-r from-[#0e91ba] to-[#3B82F6]">
      <h2 className="text-4xl font-bold mb-6">Start Making a Difference Today</h2>
      <p className="text-lg mb-8">
        Join DigiBox and turn small donations into powerful community impact.
      </p>
      <Link
        to="/signup"
        className="px-8 py-3 bg-white text-[#0a2e52] font-bold rounded-full hover:bg-gray-200 transition"
      >
        Join Now
      </Link>
    </section>
  );
};

export default CallToAction;
