// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
  getProjectAnalytics,
  getTeamCollaboration,
  getRecentTasks,
  getProjectProgress,
  getNextMeeting,
  getCollaborativeProjects,
  fetchProjectAnalyticsById,
  getTeamMembersWithStats,
  getAllTeamLeadsStats,
  getTeamSummary,
  getOverdueTasks,
  getTaskStats,
  getDashboardStats, // Legacy endpoint
  
} = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/authMiddleware");

// ------------------------------
// Main Dashboard Endpoints
// ------------------------------
router.get("/summary", authMiddleware, getDashboardSummary);            
router.get("/analytics", authMiddleware, getProjectAnalytics);           
router.get("/team-collaboration", authMiddleware, getTeamCollaboration); 
router.get("/getRecentTasks", authMiddleware, getRecentTasks);           
router.get("/project-progress/:id", getProjectProgress);     
router.get("/next-meeting", authMiddleware, getNextMeeting);             
router.get("/collaborations", authMiddleware, getCollaborativeProjects); 
router.get("/project-analytics/:id", fetchProjectAnalyticsById);
router.get("/:teamId/members", authMiddleware, getTeamMembersWithStats);
router.get("/team-leads", authMiddleware, getAllTeamLeadsStats);
router.get("/TeamSummary", getTeamSummary);
router.get("/overdueTask", getOverdueTasks);
router.get("/task-stats", authMiddleware , getTaskStats);
// ------------------------------
// Legacy Endpoint (for backward compatibility)
// ------------------------------
router.get("/stats", authMiddleware, getDashboardStats);

module.exports = router;
