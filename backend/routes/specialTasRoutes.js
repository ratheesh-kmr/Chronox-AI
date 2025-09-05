const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getTask,
  setTask,
  deleteAllTask,
  deleteTask,
  updateTask,
} = require("../controllers/specialTaskController");
const router = express.Router();

router
  .route("/")
  .get(authMiddleware, getTask)
  .post(authMiddleware, setTask)
  .delete(authMiddleware, deleteAllTask);

router
  .route("/:id")
  .put(authMiddleware, updateTask)
  .delete(authMiddleware, deleteTask);

module.exports = router;
