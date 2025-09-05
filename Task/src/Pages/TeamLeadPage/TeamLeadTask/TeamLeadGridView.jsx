import React, { useState } from "react";
import { CalendarDays, Flag, Pencil, Trash2, User2, Files } from "lucide-react";
import Swal from "sweetalert2";
import { deleteTask } from "../../../Services/services";
import { handleTaskExtension } from "../../../Services/pendingApprovalServices";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function TeamLeadTaskGridView({ tasks, onEdit, onTaskUpdate }) {
  const [expandedId, setExpandedId] = useState(null);

  // Get logged in user info
  const userRole = sessionStorage.getItem("role");
  const userId = sessionStorage.getItem("userId");

  // Determine if the user can manage (edit/delete) tasks
  const canManageTasks = userRole !== "EMPLOYEE";

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the task.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteTask(id);
        Swal.fire("Deleted!", "Task has been deleted.", "success");
        onTaskUpdate?.();
      } catch (error) {
        Swal.fire("Error", "Failed to delete task.", "error");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ToDo":
        return "bg-yellow-400";
      case "InProgress":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      case "OverDue":
        return "bg-red-500";
      case "Upcoming":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  // Separate tasks into categories
  const myId = sessionStorage.getItem("userId");

const myTasks = tasks.filter(
  (task) =>
    Array.isArray(task.assignedTo) &&
    task.assignedTo.some((user) => user?._id === myId)
);

const regularTasks = tasks.filter(
  (task) =>
    task.status !== "OverDue" &&
    !(Array.isArray(task.assignedTo) && task.assignedTo.some((user) => user?._id === myId))
);

const overdueTasks = tasks.filter((task) => task.status === "OverDue" && task.assignedTo.some((user) => user?._id !== myId));

  const renderTaskCard = (task, allowManage = true) => {
    const isExpanded = expandedId === task._id;
    

    return (
      <motion.div
        key={task._id}
        layout
        transition={{ layout: { duration: 0.4, type: "spring" } }}
        className={`relative rounded-2xl p-5 hover:shadow-lg transition duration-300 cursor-pointer ${
          isExpanded ? "bg-indigo-50 col-span-2 row-span-1" : "bg-white"
        }`}
        onClick={() => setExpandedId(expandedId === task._id ? null : task._id)}
      >
        {/* Action Buttons - Only show for non-employees and if allowed */}
        {canManageTasks && allowManage && (
          <div className="absolute top-3 right-3 flex space-x-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task, userId);
              }}
              className="text-indigo-600 hover:text-indigo-800"
              title="Edit Task"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task._id);
              }}
              className="text-red-500 hover:text-red-700"
              title="Delete Task"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Task Title */}
        <h3 className="font-bold text-lg text-indigo-700 mb-1 truncate">
          {task.taskList}
        </h3>

        {/* Summary or Full Description */}
        <p className={`text-sm text-gray-600 mb-2 ${isExpanded ? "" : "line-clamp-2"}`}>
          {task.description || "No description provided."}
        </p>

        {/* Assigned To */}
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <User2 size={14} className="mr-1" />
          Assigned To:{" "}
          <span className="ml-1 text-gray-800">
            {Array.isArray(task.assignedTo) && task.assignedTo.length > 0
              ? task.assignedTo.map((user) => user?.name).filter(Boolean).join(", ")
              : "Unassigned"}
          </span>
        </div>

        {/* Project */}
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <Files size={14} className="mr-1" />
          Project:{" "}
          <span className="ml-1 text-gray-800">
            {task.projectName?.projectName || "None"}
          </span>
        </div>

        {/* Priority */}
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <Flag size={14} className="mr-1" />
          Priority: <span className="ml-1 text-gray-800">{task.priority || "None"}</span>
        </div>

        {/* Status */}
        <div
          className={`text-xs font-semibold text-white inline-block px-2 py-1 rounded mt-2 ${getStatusColor(
            task.status
          )}`}
        >
          {task.status}
        </div>

        {/* Expanded View Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-sm space-y-2"
            >
              <p>
                <CalendarDays className="inline mr-1" size={14} />
                Start: {task.taskStartDate ? format(new Date(task.taskStartDate), "PPP") : "N/A"}
              </p>
              <p>
                <CalendarDays className="inline mr-1" size={14} />
                End: {task.taskEndDate ? format(new Date(task.taskEndDate), "PPP") : "N/A"}
              </p>
              <p>
                Created by: <strong>{task.createdBy?.name || "Unknown"}</strong>
              </p>
              <p>
                Created on:{" "}
                {task.createdAt ? format(new Date(task.createdAt), "PPP p") : "N/A"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-10">
      {/* My Tasks Section */}
      {myTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">My Tasks</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {myTasks.map((task) => renderTaskCard(task, false /* disable edit/delete */))}
          </div>
        </div>
      )}

      {/* All Tasks Section */}
      {regularTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Tasks</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regularTasks.map((task) => renderTaskCard(task, true))}
          </div>
        </div>
      )}

      {/* Overdue Tasks Section */}
      {overdueTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-red-600 mb-4">Overdue Tasks</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {overdueTasks.map((task) => renderTaskCard(task, true))}
          </div>
        </div>
      )}
    </div>
  );
}
