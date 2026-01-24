import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

/* Creator */
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import CreateCause from "./pages/creator/CreateCause";
import MyCauses from "./pages/creator/MyCauses";

/* Admin */
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddOfficer from "./pages/admin/AddOfficer";
import ApproveCauses from "./pages/admin/ApproveCauses";
import AdminStructure from "./pages/admin/AdminStructure";
import ManageUsers from "./pages/admin/ManageUsers";
import PublishCauses from "./pages/admin/PublishCauses";

/* GS */
import GSDashboard from "./pages/gs/GSDashboard";
import Documents from "./pages/gs/Documents";
import PendingCauses from "./pages/gs/PendingCauses";
import ResetPassword from "./pages/gs/ResetPassword";

/* DS */
import DSDashboard from "./pages/ds/DSDashboard";
import DSPendingCauses from "./pages/ds/DSPendingCauses";
import DSDocuments from "./pages/ds/DSDocuments";
import DSResetPassword from "./pages/ds/DSResetPassword";

/* Donor */
import DonorDashboard from "./pages/donor/DonorDashboard";
import BrowseCauses from "./pages/donor/BrowseCauses";
import CompletedCauses from "./pages/donor/CompletedCauses";
import CauseDetails from "./pages/donor/CauseDetails";
import DonationHistory from "./pages/donor/DonationHistory";
import Donate from "./pages/donor/Donate";

const AppContent = () => {
  const location = useLocation();

  // Hide Navbar & Footer for all dashboards
  const isDashboard =
    location.pathname.startsWith("/creator") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/gs") ||
    location.pathname.startsWith("/ds") ||
    location.pathname.startsWith("/donor");

  return (
    <div className="bg-[#111827] text-white min-h-screen flex flex-col">
      {!isDashboard && <Navbar />}

      <main className="flex-grow">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          {/* Creator */}
          <Route path="/creator/creator-dashboard" element={<CreatorDashboard />} />
          <Route path="/creator/create-cause" element={<CreateCause />} />
          <Route path="/creator/causes" element={<MyCauses />} />

          {/* Admin */}
          <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/approve-causes" element={<ApproveCauses />} />
          <Route path="/admin/publish-causes" element={<PublishCauses />} />
          <Route path="/admin/add-officer" element={<AddOfficer />} />
          <Route path="/admin/structure" element={<AdminStructure />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />

          {/* GS */}
          <Route path="/gs/gs-dashboard" element={<GSDashboard />} />
          <Route path="/gs/gs-pendingcauses" element={<PendingCauses />} />
          <Route path="/gs/gs-documents" element={<Documents />} />
          <Route path="/gs/gs-resetpassword" element={<ResetPassword />} />

          {/* DS */}
          <Route path="/ds/ds-dashboard" element={<DSDashboard />} />
          <Route path="/ds/ds-pendingcauses" element={<DSPendingCauses />} />
          <Route path="/ds/ds-documents" element={<DSDocuments />} />
          <Route path="/ds/ds-resetpassword" element={<DSResetPassword />} />

          {/* Donor */}
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/browse-causes" element={<BrowseCauses />} />
          <Route path="/donor/completed-causes" element={<CompletedCauses />} />
          <Route path="/donor/cause-details/:id" element={<CauseDetails />} />
          <Route path="/donor/donation-history" element={<DonationHistory />} />
          <Route path="/donor/donate/:causeId" element={<Donate />} />
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
