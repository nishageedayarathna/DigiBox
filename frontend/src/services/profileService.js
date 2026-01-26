import axios from "axios";

const API_URL = "http://localhost:5000/api/profile";

// Get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Get user profile
export const getProfile = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(API_URL, profileData, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (imageData) => {
  try {
    const response = await axios.put(
      `${API_URL}/upload-image`,
      { profileImage: imageData },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Upload image error:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (passwordData) => {
  try {
    const response = await axios.put(
      `${API_URL}/reset-password`,
      passwordData,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

const profileService = {
  getProfile,
  updateProfile,
  uploadProfileImage,
  resetPassword,
};

export default profileService;
