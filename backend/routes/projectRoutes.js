const express = require("express");
const router = express.Router();

const {
  getProjects,
  getProject,
  setProjects,
  updateProjects,
  deleteProject,
  deleteAllProjects,
  getProjectsLog,
  getProjectsDelete,
  restoreProject,
  AllRestoreProject,
  getProjectsByUser,
  getActiveProjects,
  
} = require("../controllers/projectController");

const { authMiddleware } = require("../middleware/authMiddleware");

router.route("/projectLog").get(authMiddleware, getProjectsLog);
router.route("/deleted").get(authMiddleware, getProjectsDelete);
router.route("/restore/:id").put(authMiddleware, restoreProject);
router.route("/allRestore").put(authMiddleware, AllRestoreProject);


router
  .route("/")
  .get(getProjects)
  .post(authMiddleware, setProjects)
  .delete(deleteAllProjects);
router
  .route("/:id")
  .get(getProject)
  .put(authMiddleware, updateProjects)
  .delete(authMiddleware, deleteProject);

router.get("/user/:userId", getProjectsByUser);
router.get("/active", getActiveProjects);




module.exports = router;
