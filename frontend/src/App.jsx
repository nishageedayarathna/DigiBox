import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";

// Creator
import CreatorDashboard from "./pages/creator/CreatorDashboard";
import CreateCause from "./pages/creator/CreateCause";
import MyCauses from "./pages/creator/MyCauses";

//Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AddOfficer from "./pages/admin/AddOfficer";
import ApproveCauses from "./pages/admin/ApproveCauses";
import ManageUsers from "./pages/admin/ManageUsers";
import PublishCauses from "./pages/admin/PublishCauses";

//GS
import GSDashboard  from "./pages/gs/GSDashboard";
import Documents from "./pages/gs/Documents";
import PendingCauses from "./pages/gs/PendingCauses";
import ResetPassword from "./pages/gs/ResetPassword";

//DS
import DSDashboard from "./pages/ds/DSDashboard";
import DSPendingCauses from "./pages/ds/DSPendingCauses";
import DSDocuments from "./pages/ds/DSDocuments";
import DSResetPassword from "./pages/ds/DSResetPassword";


// ✅ Auth guard
const PrivateRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token) return <Navigate to="/login" />;

  if (role && user.role !== role) return <Navigate to="/login" />;

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Creator Routes */}
        <Route path="/creator/dashboard" element={<PrivateRoute role="creator"><CreatorDashboard /></PrivateRoute>} />
        <Route path="/creator/create-cause" element={<PrivateRoute role="creator"><CreateCause /></PrivateRoute>} />
        <Route path="/creator/my-causes" element={<PrivateRoute role="creator"><MyCauses /></PrivateRoute>} />

        {/*Admin Routes*/}
        <Route path="/admin/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/approve-causes" element={<ApproveCauses />} />
        <Route path="/admin/publish-causes" element={<PublishCauses />} />
        <Route path="/admin/add-officer" element={<AddOfficer />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />

        {/*GS Routes */}
        <Route path="/gs/gs-dashboardlayout" element={<GSDashboardLayout />}/>
        <Route path="/gs/gs-dashboard" element={<GSDashboard />}/>
        <Route path="/gs/gs-pendingcauses" element={<PendingCauses />}/>
        <Route path="/gs/gs-resetpassword" element={<ResetPassword />}/>
        <Route path="/gs/gs-documents" element={<Documents/>}/>

        {/*DS Routes */}
        
        <Route path="/ds/ds-dashboard" element={<DSDashboard />}/>
        <Route path="/ds/ds-pendingcauses" element={<DSPendingCauses />}/>
        <Route path="/ds/ds-resetpassword" element={<DSResetPassword />}/>
        <Route path="/ds/ds-documents" element={<DSDocuments/>}/>


        
        {/* Default fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
