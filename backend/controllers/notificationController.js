// controllers/notificationController.js
const Notification = require("../models/notificationModel");

exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);

    // Emit real-time event using Socket.IO
    req.io.to(notification.user.toString()).emit("new_notification", notification);

    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id , deleted : false})
      .sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { $set: { read: true } }
  );
  res.status(200).json({ message: "All notifications marked as read" });
};

exports.softDeleteNotifications = async (req,res) => {
  await Notification.updateMany(
    { user: req.user._id, deleted: false },
    { $set: { deleted: true } }
  );
  res.status(200).json({ message: "All notifications soft deleted " });
};

exports.markOneAsRead = async (req, res) => {
  try {
    const { id } = req.params; // Notification ID from URL params

    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user._id }, // Ensure the notification belongs to the logged-in user
      { $set: { read: true } },
      { new: true }
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({
      message: "Notification marked as read",
      notification: updatedNotification,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUnreadTaskCount = async (req, res) => {
  try {
    const userId = req.user._id; // assuming auth middleware sets req.user
    const count = await Notification.countDocuments({
      user: userId,
      type: "TASK",
      read: false,
      deleted: false
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.markTaskNotificationsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.updateMany(
      { user: userId, type: "TASK", read: false },
      { $set: { read: true } }
    );
    res.json({ message: "Task notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};