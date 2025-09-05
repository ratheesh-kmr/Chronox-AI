
import axios from "axios";
import { data } from "react-router-dom";

const token = sessionStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/",
  headers: {
    authorization: `Bearer ${token}`,
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Get all pending users 
export const getPendingUsers = async () => {
  const { data } = await axiosInstance.get("/api/users/getPendingUsers"); 
  console.log("Fetched pending users:", data.pendingUserList);
  return data.pendingUserList || []; 
};


// Approve or reject user
export const updateUserStatus = async (userId, status) => {
  const { data } = await axiosInstance.patch(`/api/users/${userId}/status`, { status });
  return data.users;
};

// Creator approves/rejects extension
export const handleTaskExtension = async (taskId, decision) => {
  try {
    const response = await axiosInstance.post("/api/task/handle-extension", {
      taskId,
      decision, // "APPROVED" or "REJECTED"
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchExtensionRequests = async () => {
  try {
    const res = await axiosInstance.get("/api/task/extension-requests");
    return res.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchExtensionRequestsByUser = async (userId) => {
  try {
    const res = await axiosInstance.get(`/api/task/extension-requests/user/${userId}`);
    return res.data.tasks;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
