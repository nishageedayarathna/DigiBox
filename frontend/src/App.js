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

//Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddOfficer from "./pages/admin/AddOfficer";
import ApproveCauses from "./pages/admin/ApproveCauses";
import AdminStructure from "./pages/admin/AdminStructure";
import ManageUsers from "./pages/admin/ManageUsers";

//import GS 

import GSDashboard from "./pages/gs/GSDashboard"
import Documents from "./pages/gs/Documents";
import PendingCauses from "./pages/gs/PendingCauses";
import ResetPassword from "./pages/gs/ResetPassword";

const AppContent = () => {
  const location = useLocation();

  // Hide navbar + footer for creator & admin dashboards
  const dashboardPaths = [
    "/creator/creator-dashboard",
    "/creator/create-cause",
    "/creator/causes",
    "/admin/admin-dashboard",
    "/admin/add-officer",
    "/admin/approve-causes",
    "/admin/structure",
    "/admin/manage-users",
    "/gs/gs-dashboard",
    "/gs/gs-pendingcauses",
    "/gs/gs-documents", 
    "/gs/gs-resetpassword",
    

  ];

  const isDashboard = dashboardPaths.includes(location.pathname);

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

          {/*Admin Routes*/}
        <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/approve-causes" element={<ApproveCauses />} />
        <Route path="/admin/add-officer" element={<AddOfficer />} />
        <Route path="/admin/structure" element={<AdminStructure />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />

      {/*GS Routes */}
        
        <Route path="/gs/gs-dashboard" element={<GSDashboard />}/>
        <Route path="/gs/gs-pendingcauses" element={<PendingCauses />}/>
        <Route path="/gs/gs-resetpassword" element={<ResetPassword />}/>
        <Route path="/gs/gs-documents" element={<Documents/>}/>


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
