import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/gs",
});
export const fetchGSDocuments = () => API.get("/documents");

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ---------- GS APIs ----------
export const fetchGSDashboard = () => API.get("/dashboard");

export const fetchPendingCauses = () => API.get("/pending-causes");

export const approveCause = (id, data) =>
  API.put(`/approve/${id}`, data);

export const rejectCause = (id, reason) =>
  API.put(`/reject/${id}`, { reason });

export const resetGSPassword = (newPassword) =>
  API.put("/reset-password", { newPassword });
