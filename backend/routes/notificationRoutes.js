// routes/notificationRoutes.js
const express = require("express");
const { createNotification, getNotifications, markAllAsRead,softDeleteNotifications,markOneAsRead ,getUnreadTaskCount,markTaskNotificationsRead  } = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createNotification);
router.get("/", authMiddleware, getNotifications);
router.put("/", authMiddleware, markAllAsRead);
router.put("/delete",authMiddleware,softDeleteNotifications);
router.put("/:id/mark-read", authMiddleware, markOneAsRead);
router.get("/tasks/unread-count", authMiddleware, getUnreadTaskCount);
router.put("/tasks/mark-read", authMiddleware, markTaskNotificationsRead);




module.exports = router;
