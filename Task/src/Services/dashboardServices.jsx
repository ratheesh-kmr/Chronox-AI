// services/dashboardApi.js
import axios from "axios";

const token = sessionStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: "https://chronox-server.xicsolutions.in/",
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

// ------------------------------
// DASHBOARD SERVICES
// ------------------------------

// Dashboard Summary Stats
export const fetchDashboardSummary = async () => {
  try {
    const response = await axiosInstance.get("api/dashboard/summary");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    throw error;
  }
};

// Project Analytics (Weekly / Overall)
export const fetchProjectAnalytics = async () => {
  try {
    const response = await axiosInstance.get("api/dashboard/analytics");
    return response.data;
  } catch (error) {
    console.error("Error fetching project analytics:", error);
    throw error;
  }
};

// Team Collaboration Data
export const fetchTeamCollaboration = async () => {
  try {
    const response = await axiosInstance.get("api/dashboard/team-collaboration");
    return response.data;
  } catch (error) {
    console.error("Error fetching team collaboration data:", error);
    throw error;
  }
};

// Project Tasks (latest / active tasks overview)
export const fetchProjectTasks = async () => {
  try {
    const response = await axiosInstance.get("api/dashboard/project-tasks");
    return response.data;
  } catch (error) {
    console.error("Error fetching project tasks:", error);
    throw error;
  }
};

// Project Progress (progress % circle chart)
export const fetchProjectProgress = async () => {
  try {
    const response = await axiosInstance.get("api/dashboard/project-progress");
    return response.data;
  } catch (error) {
    console.error("Error fetching project progress:", error);
    throw error;
  }
};

// Next Meeting Reminder
export const fetchNextMeeting = async () => {
  try {
    const response = await axiosInstance.get("api/dashboard/next-meeting");
    return response.data;
  } catch (error) {
    console.error("Error fetching next meeting:", error);
    throw error;
  }
};

// Collaborative Projects (cross-team work)
export const fetchCollaborativeProjects = async () => {
  try {
    const response = await axiosInstance.get("/api/dashboard/collaborations");
    return response.data.collaborativeProjects;
  } catch (error) {
    console.error("Error fetching collaborative projects:", error);
    throw error;
  }
};

// Project Analytics By Project Id (for dropdown filter)
export const fetchProjectAnalyticsById = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/api/analytics/project-tasks/${projectId}`);
    return response.data.analytics;
  } catch (error) {
    console.error(`Error fetching analytics for project ${projectId}:`, error);
    throw error;
  }
};

// ------------------------------
// UTILITY - Fetch all in parallel
// ------------------------------
export const fetchAllDashboardData = async () => {
  try {
    const [
      summaryData,
      analyticsData,
      teamData,
      tasksData,
      progressData,
      meetingData,
      collaborations,
    ] = await Promise.all([
      fetchDashboardSummary(),
      fetchProjectAnalytics(),
      fetchTeamCollaboration(),
      fetchProjectTasks(),
      fetchProjectProgress(),
      fetchNextMeeting(),
      fetchCollaborativeProjects(),
    ]);

    return {
      summary: summaryData,
      analytics: analyticsData,
      team: teamData,
      tasks: tasksData,
      progress: progressData,
      meeting: meetingData,
      collaborations,
    };
  } catch (error) {
    console.error("Error fetching all dashboard data:", error);
    throw error;
  }
};
