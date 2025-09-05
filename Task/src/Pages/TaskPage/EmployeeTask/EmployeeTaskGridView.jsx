import React, { useState, useEffect } from "react";
import { CalendarDays, Flag, Pencil, Trash2, User2, Files } from "lucide-react";
import Swal from "sweetalert2";
import { deleteTask, fetchProjects } from "../../../Services/services";
import { fetchCreatorNameByUserId, requestTaskExtension } from "../../../Services/EmployeeServices";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export default function EmployeeTaskGridView({ tasks, onEdit, onTaskUpdate }) {
  const [expandedId, setExpandedId] = useState(null);
  const [creators, setCreators] = useState({}); // { userId: name }
  const [projects, setProjects] = useState([]); // Add state for projects

  const userRole = sessionStorage.getItem("role");
  const canManageTasks = userRole !== "EMPLOYEE" ;

  // Fetch creator names and project data when tasks change
  useEffect(() => {
    const fetchRequiredData = async () => {
      try {
        const creatorMap = { ...creators };
        const uniqueCreatorIds = [
          ...new Set(tasks.map((t) => t.createdBy).filter(Boolean)),
        ];

        await Promise.all(
          uniqueCreatorIds.map(async (creatorId) => {
            if (!creatorMap[creatorId]) {
              const data = await fetchCreatorNameByUserId(creatorId);
              creatorMap[creatorId] =
                data?.name || data?.username || "Unknown";
            }
          })
        );

        setCreators(creatorMap);

        // Fetch all projects to find the project name
        const projectsData = await fetchProjects();
        setProjects(projectsData);
      } catch (err) {
        console.error("Error fetching data", err);
      }
    };

    if (tasks.length > 0) {
      fetchRequiredData();
    }
  }, [tasks]);

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

  const handleRequestExtension = async (task) => {
    const { value: selectedDate } = await Swal.fire({
      title: "Request Extension",
      text: "Select a new end date for this task",
      input: "date",
      inputAttributes: {
        min: new Date().toISOString().split("T")[0], // today as min
      },
      showCancelButton: true,
      confirmButtonText: "Request",
      cancelButtonText: "Cancel",
    });

    if (selectedDate) {
      try {
        const res = await requestTaskExtension(task._id, selectedDate);
        Swal.fire("Requested!", res.message, "success");
        onTaskUpdate?.();
      } catch (err) {
        Swal.fire("Error", err.message || "Failed to request extension", "error");
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
        return "bg-blue-300";
      default:
        return "bg-gray-400";
    }
  };

  const regularTasks = tasks.filter((task) => task.status !== "OverDue");
  const overdueTasks = tasks.filter((task) => task.status === "OverDue");

  const renderTaskCard = (task) => {
    const isExpanded = expandedId === task._id;
    const project = projects.find(p => p._id === task.projectName);
    const projectName = project ? project.projectName : "None";

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
        {/* Top Right Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2 z-10">
          {canManageTasks ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
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
            </>
          ) : task.status === "OverDue" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRequestExtension(task);
              }}
              className="text-indigo-600 hover:text-indigo-800"
              title="Request Extension"
            >
              <CalendarDays size={16} />
            </button>
          ) : null}
        </div>

        <h3 className="font-bold text-lg text-indigo-700 mb-1 truncate">
          {task.taskList}
        </h3>

        <p
          className={`text-sm text-gray-600 mb-2 ${
            isExpanded ? "" : "line-clamp-2"
          }`}
        >
          {task.description || "No description provided."}
        </p>

        <div className="flex items-center text-xs text-gray-500 mb-1">
          <Files size={14} className="mr-1" />
          Project:{" "}
          <span className="ml-1 text-gray-800">
            {projectName}
          </span>
        </div>

        <div className="flex items-center text-xs text-gray-500 mb-1">
          <Flag size={14} className="mr-1" />
          Priority:{" "}
          <span className="ml-1 text-gray-800">{task.priority || "None"}</span>
        </div>

        <div
          className={`text-xs font-semibold text-white inline-block px-2 py-1 rounded mt-2 ${getStatusColor(
            task.status
          )}`}
        >
          {task.status}
        </div>

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
                Start:{" "}
                {task.taskStartDate
                  ? format(new Date(task.taskStartDate), "PPP")
                  : "N/A"}
              </p>
              <p>
                <CalendarDays className="inline mr-1" size={14} />
                End:{" "}
                {task.taskEndDate
                  ? format(new Date(task.taskEndDate), "PPP")
                  : "N/A"}
              </p>
              <p>
                Created by:{" "}
                <strong>
                  {creators[task.createdBy] || "Loading..."}
                </strong>
              </p>
              <p>
                Created on:{" "}
                {task.createdAt
                  ? format(new Date(task.createdAt), "PPP p")
                  : "N/A"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="space-y-10">
      {regularTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            All Tasks
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regularTasks.map(renderTaskCard)}
          </div>
        </div>
      )}
      {overdueTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Overdue Tasks
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {overdueTasks.map(renderTaskCard)}
          </div>
        </div>
      )}
    </div>
  );
}