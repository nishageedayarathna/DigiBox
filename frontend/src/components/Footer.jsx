import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#0a2e52] py-8 text-center text-gray-400">
      <img src="/assets/logo.png" alt="DigiBox" className="mx-auto w-12 mb-3" />
      <p>DigiBox © 2025 | Micro-Donations for a Better World</p>
      <div className="flex justify-center space-x-6 mt-4">
        <a href="#" className="hover:text-[#0a6c8b]">Facebook</a>
        <a href="#" className="hover:text-[#0a6c8b]">Instagram</a>
        <a href="#" className="hover:text-[#0a6c8b]">LinkedIn</a>
      </div>
    </footer>
  );
};

export default Footer;
