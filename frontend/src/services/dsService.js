import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/ds",
});

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ---------- DS APIs ----------
export const fetchDSDashboard = () => API.get("/dashboard");
export const fetchDSPendingCauses = () => API.get("/pending-causes");
export const approveDSCause = (id, data) => API.put(`/approve/${id}`, data);
export const rejectDSCause = (id, reason) => API.put(`/reject/${id}`, { reason });
export const resetDSPassword = (newPassword) => API.put("/reset-password", { newPassword });
export const fetchDSDocuments = () => API.get("/documents");
export const fetchDSAllCauses = (status = "all") => {
  const params = status !== "all" ? { status } : {};
  return API.get(`/all-causes?${new URLSearchParams(params)}`);
};
