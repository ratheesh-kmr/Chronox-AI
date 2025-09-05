
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


export const fetchTasks = async () => {
  try {
    const res = await axiosInstance.get("/api/tasks");
    return res.data.task;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  try {
    const res = await axiosInstance.post("/api/tasks", taskData);
    return res.data.task;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (id, updates) => {
  try {
    const res = await axiosInstance.put(`/api/tasks/${id}`, updates);
    return res.data.updatedTask;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const res = await axiosInstance.delete(`/api/tasks/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const updateTaskStatus = async (taskId, status) => {
  try {
    const res = await axiosInstance.patch(`/api/tasks/${taskId}`, { taskId, status });
    return res.data.updatedTask;
  } catch (error) {
    console.error("Error updating task status:", error);
    throw error;
  }
};
