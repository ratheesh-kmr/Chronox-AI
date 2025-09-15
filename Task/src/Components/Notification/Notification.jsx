// Components/Notifications.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markAllAsRead,
  softDeleteNotification,
  markOneAsRead,
} from "../../Services/notificationService";
import { io } from "socket.io-client";
import { Bell, Mail, X, CheckCheck, Trash2 } from "lucide-react";
import { IconBell } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Notifications({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

const handleNotificationClick = async (n) => {
  try {
    await handleRead(n._id);

    const role = sessionStorage.getItem("role");

    if (role === "EMPLOYEE" && n.type === "PROJECT") {
   
      navigate("/EmployeeProjectsPage");
    } else if (n.link) {
   
      navigate(n.link);
    }
  } catch (error) {
    console.error("Error handling notification click:", error);
  }
};


  useEffect(() => {
    const getNotifications = async () => {
      try {
        const res = await fetchNotifications();
        const fetchedNotifications = res.data.notifications;
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    getNotifications();

    const socket = io("https://chronox-server.xicsolutions.in/", {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on("new_notification", (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRead = async (id) => {
    try {
      await markOneAsRead(id);
      setNotifications(prev =>
        prev.map(n =>
          n._id === id ? { ...n, read: true, timestamp: n.timestamp } : n
        )
      );

      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await softDeleteNotification();
      setUnreadCount(0);
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  };


  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 transition-colors duration-200 cursor-pointer"
      >
        <motion.div
          whileHover={{
            rotate: [0, 15, -15, 10, -10, 5, -5, 0],
            transition: { duration: 0.6, ease: "easeInOut" }
          }}
          style={{ transformOrigin: "top center" }}
        >
          <IconBell className="text-gray-700" size={23} />
        </motion.div>

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center -mt-1 -mr-1">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-66 max-h-[70vh] overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-purple-700">Notifications</h3>
              <div className="flex space-x-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-gray-500 hover:text-green-600"
                      title="Mark all as read"
                    >
                      <CheckCheck size={18} />
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="text-red-700 hover:text-red-500"
                      title="Clear all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                <button onClick={toggleDropdown} className="text-gray-500 hover:text-gray-700">
                  <X size={18} />
                </button>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 italic p-4">No notifications.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map(n => (
                  <motion.li
                    key={n._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors duration-200 ${n.read ? "bg-gray-50 text-gray-500" : "bg-blue-50 text-gray-800 hover:bg-blue-100"
                      }`}
                  >
                    {!n.read && <Mail size={16} className="text-blue-500 flex-shrink-0 mt-1 mr-3" />}
                    <div className={`${!n.read ? 'font-semibold' : ''}`}>
                      <p className="text-sm leading-tight">{n.message}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(n.timestamp || n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
