// utils/createLog.js
const Log = require("../models/logModel");

const createLog = async (message, userId, type = "UPDATE") => {
  try {
    await Log.create({
      message,
      user: userId,
      type,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to create log:", err.message);
  }
};

module.exports = createLog;
