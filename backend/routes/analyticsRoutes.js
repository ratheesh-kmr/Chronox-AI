// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const { getProjectTaskCompletionAnalytics } = require("../controllers/analyticsController");

router.get("/project-tasks/:projectId", getProjectTaskCompletionAnalytics);

module.exports = router;
