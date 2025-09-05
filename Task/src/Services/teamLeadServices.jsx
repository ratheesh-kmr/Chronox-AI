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


export const fetchTeamOverview = async (teamId) => {
  try {
    const response = await axiosInstance.get(`/api/teamLead/team/${teamId}/overview`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team overview:", error);
    throw error;
  }
};

export const fetchTeamMembers = async (teamId) => {
  try {
    const response = await axiosInstance.get(`/api/teamLead/team/${teamId}/members`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};

export const fetchSprintProgress = async (teamId) => {
  try {
    const response = await axiosInstance.get(`/api/teamLead/team/${teamId}/sprint-progress`);
    return response.data;
  } catch (error) {
    console.error("Error fetching sprint progress:", error);
    throw error;
  }
};

export const fetchRecentActivities = async (teamId) => {
  try {
    const response = await axiosInstance.get(`/api/teamLead/team/${teamId}/recent-activities`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw error;
  }
};

export const fetchUpcomingDeadlines = async (teamId) => {
  try {
    const response = await axiosInstance.get(`/api/teamLead/team/${teamId}/upcoming-deadlines`);
    return response.data;
  } catch (error) {
    console.error("Error fetching upcoming deadlines:", error);
    throw error;
  }
};

export const fetchTeamSkills = async (teamId) => {
  try {
    const response = await axiosInstance.get(`/api/teamLead/team/${teamId}/skills`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team skills:", error);
    throw error;
  }
};
export const fetchTeamByLead = async (leadId) => {
  try {
    const response = await axiosInstance.get(`/api/team/myTeamDetails/${leadId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team by lead:", error);
    throw error;
  }
};

export const fetchTasksByTeamLead = async (teamLeadId) => {
  const res = await axiosInstance.get(`/api/teamlead/task/${teamLeadId}`);
  return res.data;
};

export const fetchTaskById = async (taskId) => {
  const res = await axiosInstance.get(`/api/teamlead/${taskId}`);
  return res.data;
};

export const fetchProjectsByTeamLead = async (teamLeadId) => {
  try {
    const response = await axiosInstance.get(`/api/teamlead/projects/${teamLeadId}`);
    return response.data.projects; 
  } catch (error) {
    console.error("Error fetching projects by team lead:", error);
    throw error;
  }
};

export const fetchProjectsOfTeammates = async (teamLeadId) => {
  const response = await axiosInstance.get(`/api/teamlead/team-mates/${teamLeadId}`);
  return response.data.projects;
};
