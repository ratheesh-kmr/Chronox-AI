import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTaskById, fetchProjectById } from "../../Services/services";
import {
  Calendar,
  ClipboardList,
  User,
  Clock,
  Flag,
  Layers,
  ListChecks,
  Repeat,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";

export default function TaskDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedTask = await fetchTaskById(id);
        setTask(fetchedTask);
        if (fetchedTask.projectName?._id) {
          const projectData = await fetchProjectById(fetchedTask.projectName._id);
          setProject(projectData);
        }
      } catch (error) {
        console.error("Error loading task or project:", error);
      }
    };

    fetchData();
  }, [id]);

  if (!task) return <div className="p-4">Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-2xl shadow-xl"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-purple-600 hover:text-purple-800 flex items-center gap-1 text-sm font-medium"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h2 className="text-3xl font-bold text-purple-800 mb-4 flex items-center gap-2">
        <ClipboardList size={24} /> {task.taskList}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} /> <strong>Start:</strong>{" "}
          {new Date(task.taskStartDate).toLocaleString()}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} /> <strong>End:</strong>{" "}
          {new Date(task.taskEndDate).toLocaleString()}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <User size={16} /> <strong>Assigned To:</strong>{" "}
          {task.assignedTo?.map((user) => user.name).join(", ") || "None"}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Flag size={16} /> <strong>Priority:</strong>{" "}
          {task.priority || "Normal"}
        </div>

        <div className="flex items-center gap-2 text-sm col-span-1 sm:col-span-2">
          <Clock size={16} /> <strong>Duration:</strong>{" "}
          {task.duration || "N/A"}
        </div>

        <div className="text-sm col-span-1 sm:col-span-2">
          <ListChecks size={16} className="inline mr-1" />{" "}
          <strong>Status:</strong> {task.status}
        </div>

        {/* Recurrence Details */}
        {task.recurrence?.isRecurring && (
          <div className="col-span-1 sm:col-span-2 bg-purple-100 rounded p-3 mt-2 text-sm text-purple-900">
            <div className="flex items-center gap-2">
              <Repeat size={16} />
              <strong>Recurrence:</strong> Every {task.recurrence.interval} {task.recurrence.unit}
            </div>
            {task.recurrence.recurrenceDates?.length > 0 && (
              <div className="mt-1 ml-6">
                <strong>Dates:</strong>{" "}
                {task.recurrence.recurrenceDates.map((date, i) => (
                  <span key={i}>
                    {new Date(date).toLocaleDateString()}
                    {i < task.recurrence.recurrenceDates.length - 1 && ", "}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {task.description && (
          <div className="col-span-1 sm:col-span-2 text-gray-700 mt-2">
            <strong>Description:</strong>
            <p className="mt-1 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* Project Details */}
        {project && (
          <div className="col-span-1 sm:col-span-2 border-t pt-4 mt-4 text-sm">
            <h3 className="text-lg font-semibold text-indigo-600 flex items-center gap-2 mb-2">
              <Layers size={18} /> Project Details
            </h3>
            <p>
              <strong>Name:</strong> {project.projectName}
            </p>
            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{
                __html:
                  project.description ||
                  "<i>No description provided.</i>",
              }}
            />
            <p className="mt-1">
              <strong>Status:</strong> {project.status}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
