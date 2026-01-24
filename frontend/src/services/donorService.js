import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/donor",
  withCredentials: true
});

export const getSummary = () => API.get("/summary");
export const getCauses = (search, category) =>
  API.get(`/causes?search=${search || ""}&category=${category || ""}`);

export const getCauseDetails = (id) => API.get(`/causes/${id}`);
export const donateToCause = (id, data) => API.post(`/donate/${id}`, data);
export const getHistory = () => API.get("/history");
export const getCompletedCauses = () => API.get("/causes/completed");