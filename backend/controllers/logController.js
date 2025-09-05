// controllers/logController.js
const Log = require("../models/logModel");
const asyncHandler = require("express-async-handler");

// Get all logs
const getAllLogs = asyncHandler(async (req, res) => {
  const logs = await Log.find()
    .sort({ timestamp: -1 })
    .populate("user", "name");
  res.status(200).json({ logs });
});

// Delete a log (SUPER_ADMIN only)
const deleteLog = asyncHandler(async (req, res) => {
  if (req.user.role !== "SUPER_ADMIN") {
    res.status(403);
    throw new Error("Not authorized to delete logs");
  }

  const log = await Log.findById(req.params.id);
  if (!log) {
    res.status(404);
    throw new Error("Log not found");
  }

  await log.deleteOne();
  res.status(200).json({ message: "Log deleted successfully" });
});

module.exports = { getAllLogs, deleteLog };
