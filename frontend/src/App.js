import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import CreateCause from "./pages/creator/CreateCause";

import MyCauses from "./pages/creator/MyCauses";

// ✅ Wrapper to control Navbar & Footer visibility
const AppContent = () => {
  const location = useLocation();

  // Paths where Navbar & Footer should be hidden
  const dashboardPaths = [
    "/creator/creator-dashboard",
    "/creator/create-cause",
    "/creator/causes",
  ];

  const isDashboard = dashboardPaths.includes(location.pathname);

  return (
    <div className="bg-[#111827] text-white min-h-screen flex flex-col">
      {/* ✅ Show Navbar only on non-dashboard pages */}
      {!isDashboard && <Navbar />}

      {/* ✅ Main Content */}
      <main className="flex-grow">
        <Routes>
          {/* 🌐 Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* 🧑‍💼 Creator Routes */}
          <Route path="/creator/creator-dashboard" element={<CreatorDashboard />} />
          <Route path="/creator/create-cause" element={<CreateCause />} />
          <Route path="/creator/causes" element={<MyCauses />} />
        </Routes>
      </main>

      {/* ✅ Show Footer only on non-dashboard pages */}
      {!isDashboard && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
