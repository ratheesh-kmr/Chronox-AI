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

export const fetchMeetings = async () => {
  const res = await axiosInstance.get("api/meetings");
  return res.data;
};

export const createMeeting = async (meeting) => {
  const res = await axiosInstance.post("api/meetings", meeting);
  return res.data;
};

export const updateMeeting = async (id, meeting) => {
  const res = await axiosInstance.put(`api/meetings/${id}`, meeting);
  return res.data;
};

export const deleteMeeting = async (id) => {
  const res = await axiosInstance.delete(`api/meetings/${id}`);
  return res.data;
};
