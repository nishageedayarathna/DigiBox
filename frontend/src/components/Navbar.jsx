import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-dark shadow-lg">
      <div className="flex items-center space-x-3">
        <img src="/assets/logo.png" alt="DigiBox Logo" className="w-auto h-12" />
      </div>
      <div className="space-x-6">
        <Link to="/" className="hover:text-primary-light transition">Home</Link>
        <a href="#about" className="hover:text-primary-light transition">About</a>
        <Link to="/login" className="hover:text-primary-light transition">Login</Link>
        <Link to="/signup" className="px-4 py-3 bg-primary rounded-xl hover:bg-primary-dark transition">
  Sign Up
</Link>
      </div>
    </nav>
  );
};

export default Navbar;
