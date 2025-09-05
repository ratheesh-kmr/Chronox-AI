const express = require('express');
const router = express.Router();
const teamLeadController = require('../controllers/teamLeadController');
const {authMiddleware} = require("../middleware/authMiddleware")

// Pass teamId as parameter or via req.user/session lookup as needed
router.get('/team/:teamId/overview', teamLeadController.getTeamOverview);
router.get('/team/:teamId/members', teamLeadController.getTeamMembers);
router.get('/team/:teamId/sprint-progress', teamLeadController.getSprintProgress);
router.get('/team/:teamId/recent-activities', teamLeadController.getRecentActivities);
router.get('/team/:teamId/upcoming-deadlines', teamLeadController.getUpcomingDeadlines);
router.get('/team/:teamId/skills', teamLeadController.getTeamSkills);
router.get("/task/:teamLeadId", teamLeadController.getTasksByTeamLead);
router.get("/:id", teamLeadController.getTaskById);
router.get("/projects/:teamLeadId",  teamLeadController.fetchProjectsByTeamLead);
router.get("/team-mates/:teamLeadId", teamLeadController.fetchProjectsOfTeammates);

module.exports = router;
