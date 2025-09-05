const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getTeams,
  getTeam,
  setTeams,
  updateTeams,
  deleteTeam,
  deleteAllTeams,
  getTeamsLog,
  getTeamsDelete,
  restoreTeam,
  AllRestoreTeam,
  getAllTeamsPublic,
  getTeamById,
  addMembersToTeam,
  removeMemberFromTeam,
  changeTeamLead,
  getTeamLead,
  getAllTeamStatuses,
  getTeamByLead,
} = require("../controllers/teamController");

const Role = Object.freeze({
  superAdmin: "SUPER_ADMIN",
  admin: "ADMIN",
  projectLead: "PROJECT_LEAD",
  teamLead: "TEAM_LEAD",
  employee: "EMPLOYEE",
});

// Logs and deleted/restoration
router.get("/teamLog", authMiddleware, authorizeRoles([
  Role.superAdmin, Role.admin, Role.projectLead, Role.teamLead, Role.employee
]), getTeamsLog);

router.get("/deleted", authMiddleware, getTeamsDelete);
router.put("/restore/:id", authMiddleware, restoreTeam);
router.put("/allRestore", authMiddleware, AllRestoreTeam);

// Public teams (no auth)
router.get("/public", getAllTeamsPublic);

// Main team routes
router.route("/")
  .get(authMiddleware, authorizeRoles([
    Role.superAdmin, Role.admin, Role.projectLead, Role.teamLead, Role.employee
  ]), getTeams)
  .post(authMiddleware, setTeams)
  .delete(deleteAllTeams);

router.route("/:id")
  .get(getTeamById) 
  .put(authMiddleware, updateTeams)
  .delete(authMiddleware, deleteTeam);

router.put("/:id/add-members", authMiddleware, addMembersToTeam);
router.put("/:id/change-lead", authMiddleware, changeTeamLead);
router.put("/:id/remove-member", authMiddleware, removeMemberFromTeam);
router.get("/:id/lead", authMiddleware, getTeamLead);
router.get("/status", authMiddleware, getAllTeamStatuses);
router.get("/myTeamDetails/:leadId", getTeamByLead);





module.exports = router;
