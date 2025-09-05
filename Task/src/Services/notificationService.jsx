
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

export const fetchNotifications = () => axiosInstance.get("/api/notifications");
export const markAllAsRead = () => {
  return axiosInstance.put("/api/notifications");
};
export const softDeleteNotification = () => axiosInstance.put("/api/notifications/delete")
export const markOneAsRead = (id) => {
  return axiosInstance.put(`/api/notifications/${id}/mark-read`);
};

export const fetchUnreadTaskCount = async () => {
  try {
    const response = await axiosInstance.get("api/notifications/task/unread-count");
    return response.data.count;
  } catch (error) {
    console.error("Error fetching unread task count:", error);
    throw error;
  }
};

// 🔹 Mark task notifications as read
export const markTaskNotificationsRead = async () => {
  try {
    const response = await axiosInstance.put("api/notifications/task/mark-read");
    return response.data;
  } catch (error) {
    console.error("Error marking task notifications as read:", error);
    throw error;
  }
};