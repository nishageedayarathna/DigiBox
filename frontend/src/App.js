import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

// Creator Pages
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import CreateCause from "./pages/creator/CreateCause";
import MyCauses from "./pages/creator/MyCauses";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddOfficer from "./pages/admin/AddOfficer";
import ApproveCauses from "./pages/admin/ApproveCauses";
import AdminStructure from "./pages/admin/AdminStructure";
import ManageUsers from "./pages/admin/ManageUsers";
import PublishCauses from "./pages/admin/PublishCauses";

// GS Pages
import GSDashboard from "./pages/gs/GSDashboard";
import Documents from "./pages/gs/Documents";
import PendingCauses from "./pages/gs/PendingCauses";
import ResetPassword from "./pages/gs/ResetPassword";

// DS Pages
import DSDashboard from "./pages/ds/DSDashboard";
import DSPendingCauses from "./pages/ds/DSPendingCauses";
import DSDocuments from "./pages/ds/DSDocuments";
import DSResetPassword from "./pages/ds/DSResetPassword";

const AppContent = () => {
  const location = useLocation();

  // Hide navbar + footer for dashboard pages
  const dashboardPaths = [
    "/creator/creator-dashboard",
    "/creator/create-cause",
    "/creator/causes",
    "/admin/admin-dashboard",
    "/admin/add-officer",
    "/admin/approve-causes",
    "/admin/publish-causes",      
    "/admin/manage-users",
    "/gs/gs-dashboard",
    "/gs/gs-pendingcauses",
    "/gs/gs-documents",
    "/gs/gs-resetpassword",
    "/ds/ds-dashboard",
    "/ds/ds-pendingcauses",
    "/ds/ds-documents",
    "/ds/ds-resetpassword",
  ];

  const isDashboard = dashboardPaths.includes(location.pathname);

  return (
    <div className="bg-[#111827] text-white min-h-screen flex flex-col">
      {!isDashboard && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Creator Routes */}
          <Route path="/creator/creator-dashboard" element={<CreatorDashboard />} />
          <Route path="/creator/create-cause" element={<CreateCause />} />
          <Route path="/creator/causes" element={<MyCauses />} />

          {/* Admin Routes */}
          <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/approve-causes" element={<ApproveCauses />} />
          <Route path="/admin/publish-causes" element={<PublishCauses />} /> 
          <Route path="/admin/add-officer" element={<AddOfficer />} />
          <Route path="/admin/structure" element={<AdminStructure />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />

          {/* GS Routes */}
          <Route path="/gs/gs-dashboard" element={<GSDashboard />} />
          <Route path="/gs/gs-pendingcauses" element={<PendingCauses />} />
          <Route path="/gs/gs-resetpassword" element={<ResetPassword />} />
          <Route path="/gs/gs-documents" element={<Documents />} />

          {/* DS Routes */}
          <Route path="/ds/ds-dashboard" element={<DSDashboard />} />
          <Route path="/ds/ds-pendingcauses" element={<DSPendingCauses />} />
          <Route path="/ds/ds-resetpassword" element={<DSResetPassword />} />
          <Route path="/ds/ds-documents" element={<DSDocuments />} />

        </Routes>
      </main>

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
