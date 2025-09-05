// src/Services/employeeServices.js
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

// Fetch tasks assigned to a user
export const fetchTasksByUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/task/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks by user:", error);
    throw error;
  }
};

// Fetch project progress for employee (based on token user ID)
export const fetchEmployeeProjectStatus = async () => {
  try {
    const response = await axiosInstance.get("/api/project/employee-progress");
    return response.data;
  } catch (error) {
    console.error("Error fetching project status:", error);
    throw error;
  }
};

// Fetch task chart data (e.g., daily completed tasks)
export const fetchEmployeeTaskChart = async () => {
  try {
    const response = await axiosInstance.get("/api/dashboard/employee-task-chart");
    return response.data;
  } catch (error) {
    console.error("Error fetching employee task chart:", error);
    throw error;
  }
};

// Fetch upcoming meeting for logged-in employee
export const fetchEmployeeMeeting = async () => {
  try {
    const response = await axiosInstance.get("/api/meetings/employee-next");
    return response.data;
  } catch (error) {
    console.error("Error fetching employee meeting:", error);
    throw error;
  }
};

// Fetch general stats for logged-in employee
export const fetchEmployeeStats = async () => {
  try {
    const response = await axiosInstance.get("/api/dashboard/employee-stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    throw error;
  }
};

export const fetchProjectsByUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/project/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.projects;
  } catch (error) {
    console.error("Error fetching user projects:", error);
    throw error;
  }
};

// fetch the project creator
export const fetchCreatorNameByUserId = async (userId) => {
  const res = await axiosInstance.get(`/api/task/creator/${userId}`);
  return res.data;
};

export const requestTaskExtension = async (taskId, newEndDate) => {
  try {
    const response = await axiosInstance.post("/api/task/request-extension", {
      taskId,
      newEndDate,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const fetchLoggedInUser = async () => {
  const response = await axiosInstance.get("/api/users/me");
  return response.data; // { id, name, email, role }
};