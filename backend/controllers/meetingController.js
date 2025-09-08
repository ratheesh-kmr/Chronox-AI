const asyncHandler = require("express-async-handler");
const Meeting = require("../models/meetingModel");
const User = require("../models/userModel");


const createMeeting = asyncHandler(async (req, res) => {
  const { title, description, date, link , mode ,startTime, endTime, participants, } = req.body;

  if (!title || !date || !startTime || !endTime) {
    res.status(400);
    throw new Error("Please provide title, date, start and end time");
  }

  const meeting = await Meeting.create({
    title,
    description,
    date,
    startTime,
    endTime,
    link,
    mode,
    participants,
    createdBy: req.user._id,
  });

  res.status(201).json(meeting);
});


const getMeetings = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({ deletedAt: null })
    .populate("participants", "name email")
    .populate("createdBy", "name email")
    .sort({ date: 1 });
  res.status(200).json(meetings);
});


const getNextMeeting = asyncHandler(async (req, res) => {
  const nextMeeting = await Meeting.findOne({
    date: { $gte: new Date() },
    deletedAt: null,
  })
    .sort({ date: 1 })
    .populate("participants", "name email");

  if (!nextMeeting) {
    return res.status(404).json({ message: "No upcoming meetings" });
  }

  res.status(200).json(nextMeeting);
});


const updateMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);

  if (!meeting || meeting.deletedAt) {
    res.status(404);
    throw new Error("Meeting not found");
  }

  const updatedMeeting = await Meeting.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.status(200).json(updatedMeeting);
});


const deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);

  if (!meeting || meeting.deletedAt) {
    res.status(404);
    throw new Error("Meeting not found");
  }

  meeting.deletedAt = new Date();
  await meeting.save();

  res.status(200).json({ message: "Meeting deleted successfully" });
});

module.exports = {
  createMeeting,
  getMeetings,
  getNextMeeting,
  updateMeeting,
  deleteMeeting,
};
