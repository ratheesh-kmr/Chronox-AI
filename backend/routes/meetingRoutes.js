const express = require("express");
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  getNextMeeting,
  updateMeeting,
  deleteMeeting,
  getUserMeetings,
} = require("../controllers/meetingController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Meetings CRUD
router.post("/", authMiddleware, createMeeting);
router.get("/", authMiddleware, getMeetings);
router.get("/next", authMiddleware, getNextMeeting);
router.put("/:id", authMiddleware, updateMeeting);
router.delete("/:id", authMiddleware, deleteMeeting);
router.get("/my-meetings", authMiddleware, getUserMeetings);

module.exports = router;
