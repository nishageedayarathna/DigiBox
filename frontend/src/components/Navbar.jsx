import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-[#0a2e52] shadow-lg">
      <div className="flex items-center space-x-3">
        <img src="/assets/logo.png" alt="DigiBox Logo" className="w-auto h-12" />
      </div>
      <div className="space-x-6">
        <Link to="/" className="hover:text-[#0a6c8b] transition">Home</Link>
        <a href="#about" className="hover:text-[#0a6c8b] transition">About</a>
        <Link to="/login" className="hover:text-[#0a6c8b] transition">Login</Link>
        <Link to="/signup" className="px-4 py-3 bg-[#26bfef] rounded-xl hover:bg-[#0a6c8b] transition">
  Sign Up
</Link>
      </div>
    </nav>
  );
};

export default Navbar;
