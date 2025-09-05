import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  Edit,
  Trash2,
  User,
  FileText,
  Folder,
  Circle,
  AlertTriangle,
  Loader2,
  Calendar,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { getAllLogs, deleteLog } from "../../Services/services"; // <-- added deleteLog

// Icon mapping stays the same...
const logIconMap = { /* your existing mapping */ };

const ActivityCard = ({ log, index, canDelete, onDelete }) => {
  const getIcon = (action, type) => {
    return logIconMap[action]?.[type] || logIconMap[action]?.default || (
      <Circle size={18} className="text-gray-400" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="flex items-start gap-4 bg-white border border-purple-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex-shrink-0 mt-1">{getIcon(log.action, log.type)}</div>
      <div className="flex-1">
        <p className="text-md text-gray-800 leading-snug">
          <span className="font-semibold text-purple-900">
            {log.user?.name || "System"}
          </span>{" "}
          <span className="font-normal">{log.message}</span>
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{new Date(log.timestamp).toLocaleString()}</span>
          </div>
          {log.associatedEntity && (
            <div className="flex items-center gap-1">
              <FileText size={12} />
              <span>{log.associatedEntity}</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete button for super admins */}
      {canDelete && (
        <button
          onClick={() => onDelete(log._id)}
          className="p-1 rounded-full hover:bg-red-100 text-red-500"
          title="Delete log"
        >
          <Trash2 size={18} />
        </button>
      )}
    </motion.div>
  );
};

const ActivityLogPage = () => {
  const [activityLog, setActivityLog] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Unique filter options
  const [users, setUsers] = useState([]);
  const [actions, setActions] = useState(["created", "updated", "completed", "deleted"]);

  // Assume role is stored in localStorage/session or comes from context
  const [userRole, setUserRole] = useState("");

useEffect(() => {
  const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
  setUserRole(storedUser.role || "");
}, []);


  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logs = await getAllLogs();
        const parsedLogs = logs.map((log) => {
          const lowerMsg = log.message.toLowerCase();
          let action = "updated";
          if (lowerMsg.includes("created")) action = "created";
          else if (lowerMsg.includes("deleted")) action = "deleted";
          else if (lowerMsg.includes("completed")) action = "completed";

          return { ...log, action };
        });

        setActivityLog(parsedLogs);
        setFilteredLogs(parsedLogs);

        // Extract unique users for dropdown
        const uniqueUsers = [...new Set(parsedLogs.map(l => l.user?.name).filter(Boolean))];
        setUsers(uniqueUsers);
      } catch (e) {
        console.error("Failed to load logs:", e);
        setError("Failed to fetch activity logs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Apply filters whenever filter state changes
  useEffect(() => {
    let logs = [...activityLog];

    if (selectedUser) {
      logs = logs.filter(log => log.user?.name === selectedUser);
    }
    if (selectedAction) {
      logs = logs.filter(log => log.action === selectedAction);
    }
    if (selectedDate) {
      logs = logs.filter(log => {
        const logDate = new Date(log.timestamp).toISOString().split("T")[0];
        return logDate === selectedDate;
      });
    }

    setFilteredLogs(logs);
  }, [selectedUser, selectedAction, selectedDate, activityLog]);

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;

    try {
      await deleteLog(logId);
      setActivityLog(prev => prev.filter(log => log._id !== logId));
    } catch (e) {
      console.error("Failed to delete log:", e);
      alert("Failed to delete log. Please try again.");
    }
  };

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Activity Log</h1>
          <span className="text-l text-gray-500">
            Manage and view your Activities
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl shadow-sm ">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="p-2 bg-gray-100 rounded-lg"
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="p-2 bg-gray-100 rounded-lg"
          >
            <option value="">All Actions</option>
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 bg-gray-100 rounded-lg"
          />
        </div>
      </div>

      <div className="pr-4 space-y-5 mt-4">
        {loading && (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin text-purple-500" size={48} />
            <p className="mt-4 text-lg font-medium">Loading activity logs...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-red-500">
            <AlertTriangle size={48} />
            <p className="mt-4 text-lg font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && filteredLogs.length === 0 && (
          <div className="text-center mt-20 p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <p className="text-gray-500 italic text-lg font-medium">
              ✨ No recent activity matches your filters.
            </p>
          </div>
        )}

        {!loading &&
          !error &&
          filteredLogs.map((log, index) => (
            <ActivityCard
              key={log._id || index}
              log={log}
              index={index}
              canDelete={userRole === "SUPER_ADMIN"}
              onDelete={handleDeleteLog}
            />
          ))}
      </div>
    </div>
  );
};

export default ActivityLogPage;
