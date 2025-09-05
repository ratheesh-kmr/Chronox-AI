const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getTasks,
  getTask,
  getTasksByUser,
  setTask,
  updateTask,
  deleteTask,
  deleteAllTask,
  updateTaskStatus,
  getSubTasksByTaskId,
  getTasksLog,
  getTasksDelete,
  restoreTask,
  AllRestoreTask,
  updateSubTask,
  deleteSubTask,
  deleteAllSubTask,
  restoreSubTask,
  AllRestoreSubTask,
  getTaskById,
  getProjectPendingTasks,
  getTasksByProject,  
  getUserNameById,
  requestTaskExtension,
  handleTaskExtensionRequest,
  getExtensionRequests,
  getExtensionRequestsByUser,
} = require("../controllers/taskController");

const Role = Object.freeze({
  superAdmin: "SUPER_ADMIN",
  admin: "ADMIN",
  projectLead: "PROJECT_LEAD",
  teamLead: "TEAM_LEAD",
  employee: "EMPLOYEE",
});

router.route("/taskLog").get(authMiddleware, getTasksLog);
router.route("/deleted").get(authMiddleware, getTasksDelete);
router.route("/restore/:id").put(authMiddleware, restoreTask);
router.route("/allRestore").put(authMiddleware, AllRestoreTask);

router.route("/sub/:id").put(authMiddleware, updateSubTask);
router.route("/sub/:id").delete(authMiddleware, deleteSubTask);
router.route("/sub/delete").delete(authMiddleware, deleteAllSubTask);
router.route("/sub/restore/:id").put(authMiddleware, restoreSubTask);
router.route("/sub/allRestore").put(authMiddleware, AllRestoreSubTask);
router.get("/subtasks/:taskId", authMiddleware, getSubTasksByTaskId);
router.get("/task/:id", authMiddleware, getTaskById);
router.get("/user/:userId", getTasksByUser);
router.get("/pending/:projectId", getProjectPendingTasks);
router.get("/project/:projectId", getTasksByProject);
router.get("/creator/:userId", getUserNameById);
router.post("/request-extension", authMiddleware, requestTaskExtension);
router.post("/handle-extension", authMiddleware, handleTaskExtensionRequest);
router.get("/extension-requests", authMiddleware, getExtensionRequests);
router.get("/extension-requests/user/:userId", authMiddleware, getExtensionRequestsByUser);






router
  .route("/")
  .get(
    authMiddleware,
    authorizeRoles([
      Role.superAdmin,
      Role.admin,
      Role.projectLead,
      Role.teamLead,
      Role.employee,
    ]),
    getTasks
  )
  .post(authMiddleware, setTask)
  .delete(deleteAllTask);
router
  .route("/:id")
  .get(getTask)
  .put(authMiddleware, updateTask)
  .delete(authMiddleware, deleteTask)
  .patch(
    authMiddleware,
    authorizeRoles([
      Role.superAdmin,
      Role.admin,
      Role.projectLead,
      Role.teamLead,
      Role.employee,
    ]),
    updateTaskStatus
  );

module.exports = router;
