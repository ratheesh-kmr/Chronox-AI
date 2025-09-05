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


// Register
export const register = async (registerData) => {
  try {
    console.log("Creating User:", registerData);
    const response = await axiosInstance.post("/api/users/register", registerData);
    console.log("User created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Register Error:", error.response?.data || error.message);
    throw error; // This allows the component to catch the error and show toast
  }
};


// CHANGE PASSWORD
export const changePassword = async (payload) => {
  try {
    const response = await axiosInstance.put("/api/users/change-password", payload);
    return response.data;
  } catch (error) {
    console.error("Password Change Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update password.");
  }
};

// SEND OTP (FOR EMAIL / MOBILE)
export const sendEmailOtp = async ({ email }) => {
  try {
    const response = await axiosInstance.post("/api/users/send-email-otp", { email });
    console.log(response.data, "Email OTP Sent ");
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error("Send Email OTP Error:", errMsg);
    throw new Error(errMsg);
  }
};

export const sendMobileOtp = async ({ mobile }) => {
  try {
    const response = await axiosInstance.post("/api/users/send-mobile-otp", { mobile });
    console.log(response.data, "Mobile OTP Sent ");
    return response.data;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error("Send Mobile OTP Error:", errMsg);
    throw new Error(errMsg);
  }
};



// VERIFY OTP AND UPDATE MOBILE
export const updateMobile = async ({ newMobile, otp }) => {
  try {
    const response = await axiosInstance.put("/api/users/verifyMobileOtp", {
      newMobile,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error("Update Mobile Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update mobile.");
  }
};

// VERIFY OTP AND UPDATE EMAIL
export const updateEmail = async ({ newEmail, otp }) => {
  try {
    const response = await axiosInstance.put("/api/users/verify-email-otp", {
      newEmail,
      otp,
    });
    return response.data;
  } catch (error) {
    console.error("Update Email Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update email.");
  }
};


export const fetchUser = async (req, res) => {
  try {
    const response = await axiosInstance.get("api/users/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data.users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};


export const fetchLoggedInUser = async () => {
  try {
    const response = await axiosInstance.get("api/users/me");
    return response.data; 
  } catch (error) {
    console.error("Error fetching logged in user:", error);
    throw error;
  }
};


//fetch unassigned users
export const fetchUnassignedUsers = async () => {
  try {
    const res = await axiosInstance.get("/api/users/unassigned");
   return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching unassigned users:", error);
    return [];
  }
};
  
//login user
export const login = async (loginData) => {
  try {
    const response = await axiosInstance.post("api/users/login", loginData);
    console.log("response",response.data);
    const token = response.data.token;
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("role", response.data.role);
    sessionStorage.setItem("userId", response.data.userId);
    sessionStorage.setItem("userData", JSON.stringify(response.data));
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Login error:", error);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userId");

    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};


// USER SERVICES


// Delete a user
export const deleteUser = async (userId) => {
  try {
    const response = await axiosInstance.delete(`api/users/delete/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

//  Update a user
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`api/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};




// Fetch Public teams
export const fetchTeamsPublic = async () => {
  try {
    const response = await axiosInstance.get("/api/team/public");
    return response.data.team;
  } catch (error) {
    console.error("Error fetching team:", error);
    throw error;
  }
};


// Fetch Teams

export const fetchTeams = async () => {
  try {
    const response = await axiosInstance.get("/api/team");
    return response.data.teams; 
  } catch (error) {
    throw error;
  }
};

export const getTeamById = async (id) => {
  try {
    console.log("Fetching team by ID:", id); 
    const response = await axiosInstance.get(`/api/team/${id}`); 
    console.log("Fetched teams ", response.data.team);
    return response.data.team;
 
  } catch (error) {
    console.error("Error fetching team by ID:", error);
    throw error.response?.data?.message || "Failed to fetch team";
  }
};


export const deleteTeam = async (id) => {
  try {
    await axiosInstance.delete(`/api/team/${id}`);
  } catch (error) {
    throw error;
  }
};

export const createTeam = async (teamData) => {
  try {
    const response = await axiosInstance.post("/api/team", teamData);
    return response.data;
  } catch (error) {
    console.error("Error creating team:", error)
    throw error.response?.data?.message || "Failed to create team";
  }
};


export const updateTeam = async (id, teamData) => {
  try {
    const response = await axiosInstance.put(`/api/team/${id}`, teamData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// API example to get users with no team
// services.js


export const assignMembersToTeam = async (teamId, members) => {
  try {
    const response = await axiosInstance.put(`/api/team/${teamId}/add-members`, {
      members,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to assign members:", error);
    throw error.response?.data?.message || "Failed to assign members";
  }
};

// Change team lead
export const changeTeamLead = async (teamId, newLeadId) => {
  try {
    const res = await axiosInstance.put(`/api/team/${teamId}/change-lead`, {
      newLeadId,
    });
    return res.data.team;
  } catch (error) {
    console.error("Failed to change team lead:", error);
    throw error;
  }
};
export const removeMemberFromTeam = async (teamId, memberId) => {
  try {
    const res = await axiosInstance.put(`/api/team/${teamId}/remove-member`, {
      memberId,
    });
    return res.data.team;
  } catch (error) {
    console.error("Failed to remove member:", error);
    throw error;
  }
};

export const fetchTeamLead = async (teamId) => {
  try {
    const res = await axios.get(`/api/team/${teamId}`);
    if (!res.data || !res.data.team || !res.data.team.teamLeader) {
      throw new Error("Invalid response");
    }
    return res.data.team.teamLeader; // This should be an object with `.name`
  } catch (err) {
    console.error("Failed to fetch team lead:", err);
    return { name: "N/A" };
  }
};



export const fetchActiveProjects = async () => {
  const response = await axiosInstance.get("api/project/active");
  return response.data; // { count, projects }
};




// Forgot Password 
export const forgotPassword = async ({ email, otp, password }) => {
  try {
    const { data } = await axiosInstance.put(`api/users/resetPassword`, {
      email,
      otp,
      password,
    });
    console.log(data, ".....Reset Password.....");
    return data;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error("Reset Password Error:", errMsg);
    throw new Error(errMsg);
  }
};


// Send Otp Config

export const sendOtp = async (email) => {
  try {
    const { data } = await axiosInstance.post(`api/users/sendOtp`, { email });
    console.log(data, ".....Send OTP.....");
    return data;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error("Send OTP Error:", errMsg);
    throw new Error(errMsg);
  }
};


// verify Otp Config
export const verifyOtp = async ({ email, otp }) => {
  try {
    const { data } = await axiosInstance.post(`api/users/verifyOtp`, { email, otp });
    console.log(data, ".....Verify OTP.....");
    return data;
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    console.error("Verify OTP Error:", errMsg);
    throw new Error(errMsg);
  }
};


//----------------PROJECT SERVICES---------
//Fetch Project
export const fetchProjects = async () => {
  try {
    const response = await axiosInstance.get("api/project", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data.project,"data project");
    
    return response.data.project;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

//DeleteProjects

export const deleteProject = async (id) => {
  try {
    await axiosInstance.delete(`api/project/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting Project:", error);
    throw error;
  }
};

// CreateProject

export const createProject = async (projectData) => {
  try {
    const response = await axiosInstance.post("api/project", projectData, {
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    console.log("Project created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating project:",
      error.message || error.response?.data
    );
  }
};


//  updateProject
export const updateProject = async (id, projectData) => {
  try {
    const response = await axiosInstance.put(`api/project/${id}`, projectData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Project Updated successfully:",response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error updating project:",
      error.message || error.response?.data
    );
    throw error;
  }
};

export const fetchProjectById = async (id) => {
  try {
    const response = await axiosInstance.get(`api/project/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.project; 
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};


// Fetch pending tasks for the project
export const fetchProjectPendingTasks = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/api/task/pending/${projectId}`, {
    });
    return response.data || [];
  } catch (error) {
    console.error("Error fetching pending tasks:", error);
    throw error;
  }
};





//holiday Services  
export const fetchHolidays = async () => {
  try {
    const { data } = await axiosInstance.get(`api/holiday`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data, ".....Holidays.....");
    return data.holidays;
  } catch (error) {
    console.log(error, "......error");
  }
};

export const createHolidays = async (holidays) => {
  try {
    const { data } = await axiosInstance.post(`api/holiday`, holidays, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data, ".....CreateHolidays.....");
    return data;
  } catch (error) {
    console.log(error, "......error");
  }
};

export const updateHolidays = async (id, holidays) => {
  try {
    const { data } = await axiosInstance.put(`api/holiday/${id}`, holidays, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data, ".....UpdateHolidays.....");
    return data;
  } catch (error) {
    console.log(error, "......error");
  }
};

export const deleteHolidays = async (id) => {
  try {
    const { data } = await axiosInstance.delete(`api/holiday/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data, ".....DeleteHolidays.....");
    return data;
  } catch (error) {
    console.log(error, "......error");
  }
};

export const deleteAllHolidays = async () => {
  try {
    const { data } = await axiosInstance.delete(`api/holiday/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(data, ".....All DeleteHolidays.....");
    return data;
  } catch (error) {
    console.log(error, "......error");
  }
};

//----------------------------Tasks----------------------------
export const fetchTasks = async () => {
  try {
    const response = await axiosInstance.get("api/task", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.task;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
};

export const fetchTaskById = async (id) => {
  const res = await axiosInstance.get(`/api/task/${id}`);
  return res.data.task;
};


// Delete Tasks

export const deleteTask = async (id) => {
  try {
    await axiosInstance.delete(`/api/task/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Error deleting Task:", error);
    throw error;
  }
};

// Create Task

export const createTask = async (taskData) => {
  try {
    console.log("Creating Task:", taskData);
    const response = await axiosInstance.post("api/task", taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Task created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating task:",
      error.message || error.response?.data
    );
  }
};

//  updateTask
export const updateTask = async (id, taskData) => {
  try {
    const response = await axiosInstance.put(`api/task/${id}`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating task:",
      error.message || error.response?.data
    );
    throw error;
  }
};

// frontend services/taskService.js
export const updateTaskTL = async (id, payload) => {
  try {
    const response = await axiosInstance.put(`api/task/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating task:",
      error.message || error.response?.data
    );
    throw error;
  }
};


//  updateTask
export const updateTaskList = async (taskId, status) => {
  try {
    const response = await axiosInstance.patch(
      "api/task/update-status",
      { taskId, status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error updating task:",
      error.message || error.response?.data
    );
    throw error;
  }
};

//fetch tasks by project
export const fetchProjectTasks = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/api/task/project/${projectId}`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching all project tasks:", error);
    throw error;
  }
};



export async function updateTaskStatus(taskId, newStatus) {
  return updateTask(taskId, { status: newStatus });
}

////----------------------------Employee Services//----------------------------
export const fetchTasksByUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/api/task/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tasks by user:", error);
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
    return response.data;
  } catch (error) {
    console.error("Error fetching user projects:", error);
    throw error;
  }
};

//----------------------------activity log------------------------------------------

export const fetchUserLog = async () => {
  const res = await axiosInstance.get("api/users/user/log");
  return res.data.user || [];
};

export const fetchTaskLog = async () => {
  const res = await axiosInstance.get("api/task/taskLog");
  return res.data.task || [];
};

export const fetchProjectLog = async () => {
  const res = await axiosInstance.get("api/project/projectLog");
  return res.data.project || [];
};

export const getAllLogs = async () => {
  const res = await axiosInstance.get("api/logs");
  return res.data.logs || [];
};

export const deleteLog = async (logId) => {
  const res = await axiosInstance.delete(`api/logs/${logId}`);
  return res.data; 
};    


//Milestones
export const createMilestone = async (data) => {
  try {
    const response = await axiosInstance.post("/api/milestones", data);
    return response.data;
  } catch (error) {
    console.error("Error creating milestone:", error);
    throw error;
  }
};

export const fetchMilestonesByProject = async (projectId) => {
  try {
    const response = await axiosInstance.get(`/api/milestones/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching milestones:", error);
    throw error;
  }
};

export const updateMilestone = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/milestones/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw error;
  }
};

export const deleteMilestone = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/milestones/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting milestone:", error);
    throw error;
  }
};  

// ======  teamlead services

// Teams
export const fetchTeamByLead = async (leadId) => {
  try {
    const response = await axiosInstance.get(`/api/team/myTeamDetails/${leadId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching team by lead:", error);
    throw error;
  }
};
