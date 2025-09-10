const asyncHandler = require("express-async-handler");
const Meeting = require("../models/meetingModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");


const createMeeting = asyncHandler(async (req, res) => {
  const { title, description, date, mode, startTime, endTime, participants } = req.body;

  if (!title || !date || !startTime || !endTime) {
    res.status(400);
    throw new Error("Please provide title, date, start and end time");
  }

  // Step 1: Create meeting without link (so MongoDB generates _id)
  let meeting = await Meeting.create({
    title,
    description,
    date,
    startTime,
    endTime,
    mode,
    participants,
    createdBy: req.user._id,
  });

  // Step 2: Use meeting._id to generate unique Jitsi link
  const roomName = `Chronox-Meeting-${meeting._id}`;
  const jitsiLink = `https://meet.jit.si/${roomName}`;

  // Step 3: Update meeting with the generated link
  meeting.link = jitsiLink;
  await meeting.save();

  // 🔔 Notify all participants
  if (participants && participants.length > 0) {
    for (const userId of participants) {
      const notif = await Notification.create({
        user: userId,
        title: "New Meeting Scheduled",
        message: `You have been invited to the meeting "${title}" scheduled on ${new Date(date).toLocaleDateString()} from ${startTime} to ${endTime}.`,
        type: "MEETING",
        link: `/MeetingsPage`, 
      });

      req.io.to(userId.toString()).emit("new_notification", notif);
    }
  }

  // 🔔 Notify the creator as confirmation (optional)
  const creatorNotif = await Notification.create({
    user: req.user._id,
    title: "Meeting Created",
    message: `Your meeting "${title}" has been scheduled successfully.`,
    type: "MEETING",
    link: `/MeetingsPage`,
  });
  req.io.to(req.user._id.toString()).emit("new_notification", creatorNotif);

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

  // Update meeting
  const updatedMeeting = await Meeting.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  // 🔔 Notify all participants about the update
  if (updatedMeeting.participants && updatedMeeting.participants.length > 0) {
    for (const userId of updatedMeeting.participants) {
      const notif = await Notification.create({
        user: userId,
        title: "Meeting Updated",
        message: `The meeting "${updatedMeeting.title}" scheduled on ${new Date(
          updatedMeeting.date
        ).toLocaleDateString()} from ${updatedMeeting.startTime} to ${
          updatedMeeting.endTime
        } has been updated.`,
        type: "MEETING",
        link: `/UserMeetingsPage`,
      });

      req.io.to(userId.toString()).emit("new_notification", notif);
    }
  }

  const creatorNotif = await Notification.create({
    user: meeting.createdBy,
    title: "Meeting Updated",
    message: `Your meeting "${updatedMeeting.title}" has been updated successfully.`,
    type: "MEETING",
    link: `/MeetingsPage`,
  });
  req.io.to(meeting.createdBy.toString()).emit("new_notification", creatorNotif);

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

const getUserMeetings = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; 

    const meetings = await Meeting.find({
      participants: userId,
      deletedAt: null,
    })
      .populate("createdBy", "name email")
      .populate("participants", "name email role")
      .sort({ date: 1 });

    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error fetching user meetings:", error);
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
});


module.exports = {
  createMeeting,
  getMeetings,
  getNextMeeting,
  updateMeeting,
  deleteMeeting,
  getUserMeetings,
};
