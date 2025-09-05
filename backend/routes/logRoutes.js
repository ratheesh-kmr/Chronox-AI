// routes/logRoutes.js
const express = require("express");
const { getAllLogs,deleteLog } = require("../controllers/logController");
const { authMiddleware } = require("../middleware/authMiddleware");



const router = express.Router();

router.get("/",authMiddleware, getAllLogs);
router.delete("/:id",authMiddleware, deleteLog);

module.exports = router;
