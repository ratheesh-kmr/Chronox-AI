import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchProjectById, fetchProjectPendingTasks } from "../../Services/services";
import MilestoneSection from "../../Components/Milestone/MilestoneSection";

import { format } from "date-fns";
import {
  IconUser,
  IconCalendar,
  IconCheck,
  IconClock,
  IconArrowLeft,
  IconInfoCircle,
  IconCrown,

} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

// Generate consistent color per name
const getColorForName = (name = "") => {
  const colors = [
    "bg-blue-100 text-blue-700",
  ];
  return colors[name.charCodeAt(0) % colors.length];
};

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(true);

  const priorityColor = {
    High: "bg-red-100 text-red-600",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-600",
  };

  const statusColor = {
    ToDo: "bg-blue-100 text-blue-600",
    InProgress: "bg-orange-100 text-orange-600",
    Completed: "bg-green-100 text-green-600",
    OverDue: "bg-red-100 text-red-600",
    Upcoming: "bg-orange-100 text-orange-600",
  };

  useEffect(() => {
    const loadProjectAndTasks = async () => {
      try {
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);
        console.log(projectData);

        const tasksResponse = await fetchProjectPendingTasks(projectId);
        // Handle the response structure: { tasks: [...] }
        const tasks = tasksResponse?.tasks || [];
        setPendingTasks(tasks);
      } catch (err) {
        console.error("Error loading data:", err);
        setProject(null);
        setPendingTasks([]);
      } finally {
        setLoading(false);
        setTasksLoading(false);
      }
    };

    if (projectId) loadProjectAndTasks();
  }, [projectId]);

  if (loading) {
    return <div className="text-center mt-10 text-purple-600">Loading project details...</div>;
  }

  if (!project) {
    return <div className="text-center mt-10 text-red-500">Project not found.</div>;
  }

  return (
    <div className="p-6  mx-auto space-y-6 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl">
      {/* Navigation */}
      <div className="flex gap-3">
        <IconInfoCircle className="text-purple-800 mt-1.5" />
        <button><span className="text-gray-500">Quick links</span></button>
        <button
          onClick={() => navigate("/ProjectPage")}
          className="flex items-center gap-2 text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-200 transition"
        >
          <IconArrowLeft size={16} />
          Back to Projects
        </button>
        <button
          onClick={() => navigate("/Teams")}
          className="flex items-center gap-2 text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-200 transition"
        >
          <IconArrowLeft size={16} />
          Switch to teams
        </button>
      </div>

      {/* Project Info */}
      <h1 className="text-3xl font-bold text-black">{project.projectName}</h1>
      <p
        className="text-gray-600"
        dangerouslySetInnerHTML={{ __html: project.description || "<i>No description provided.</i>" }}
      />

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Project Info Card */}
        <div className="p-4 rounded-xl shadow-sm bg-purple-50">
          <h3 className="font-semibold mb-2">Project Info</h3>
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <IconCalendar size={16} /> Start Date: {format(new Date(project.projectStartDate), "PP")}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <IconClock size={16} /> Delivery Date: {format(new Date(project.projectDeliveryDate), "PP")}
          </p>
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <IconCheck size={16} /> Status: {project.status}
          </p>
        </div>

        {/* Team Members */}
        <div className="p-4 rounded-xl shadow-sm bg-purple-50">
          <h3 className="font-semibold mb-2">Team Members</h3>
          {project.members?.length > 0 ? (
            <ul className="space-y-2 text-sm text-gray-700">
              {project.members.map((member) => (
                <li
                  key={member._id}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full font-medium w-fit ${getColorForName(member.name)}`}
                >
                  <IconUser size={14} />
                  <span>{member.name}</span>

                  {/* Show crown if member is TEAM_LEAD */}
                  {member.role == "TEAM_LEAD" && (
                    <IconCrown size={16} className="text-yellow-600" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No members assigned.</p>
          )}
        </div>

      </div>

      {/* Milestones & Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {/* Milestones Placeholder */}
        <MilestoneSection projectId={projectId} />



        {/* Pending Tasks */}
        <div className="p-4 rounded-xl shadow-sm bg-purple-50 ">
          <h3 className="font-semibold mb-2">
            Pending Tasks <span className="text-sm text-gray-500">({pendingTasks.length})</span>
          </h3>

          {tasksLoading ? (
            <p className="text-sm text-gray-500">Loading pending tasks...</p>
          ) : pendingTasks.length > 0 ? (
            <>
              <AnimatePresence initial={false}>
                <motion.div
                  layout
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <ul className="space-y-2 text-sm text-gray-700 overflow-hidden cursor-pointer">
                    {pendingTasks
                      .sort((a, b) => {
                        const order = { High: 1, Medium: 2, Low: 3 };
                        return (order[a.priority] || 4) - (order[b.priority] || 4);
                      })
                      .slice(0, expanded ? pendingTasks.length : 3)
                      .map((task) => (
                        <motion.li
                          key={task._id}
                          className="p-3 rounded-md bg-white shadow-sm border border-purple-100"
                          layout
                          onClick={() => navigate(`/TaskDetailsPage/${task._id}`)}

                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-purple-800 flex-1">{task.taskList}</span>
                            <div className="flex gap-2 ml-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[task.priority] || "bg-gray-100 text-gray-500"
                                  }`}
                              >
                                {task.priority || "None"}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[task.status] || "bg-gray-100 text-gray-500"
                                  }`}
                              >
                                {task.status || "Unknown"}
                              </span>
                            </div>
                          </div>

                          {/* Task Description */}
                          {task.description && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {/* Task Duration */}
                          {task.duration && (
                            <p className="text-xs text-gray-500 mb-2">
                              Duration: {task.duration}
                            </p>
                          )}

                          {/* Assigned Users */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {Array.isArray(task.assignedTo) && task.assignedTo.length > 0 ? (
                              task.assignedTo.map((user) => (
                                <div
                                  key={user._id}
                                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${getColorForName(user.name)}`}
                                >
                                  <IconUser size={12} />
                                  {user.name}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">Unassigned</span>
                            )}
                          </div>

                          {/* Task Dates */}
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>
                              Start: {task.taskStartDate ? format(new Date(task.taskStartDate), "PP") : "N/A"}
                            </span>
                            <span>
                              Due: {task.taskEndDate ? format(new Date(task.taskEndDate), "PP") : "N/A"}
                            </span>
                          </div>

                          {/* Recurrence Info */}
                          {task.recurrence?.type !== "None" && (
                            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              Recurs: {task.recurrence.type}
                              {task.recurrence.repeatCount > 0 && ` (${task.recurrence.repeatCount} times)`}
                            </div>
                          )}
                        </motion.li>
                      ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              {pendingTasks.length > 3 && (
                <button
                  onClick={() => setExpanded((prev) => !prev)}
                  className="mt-2 text-sm text-purple-600 hover:underline cursor-pointer"
                >
                  {expanded ? `Show Less` : `Show All ${pendingTasks.length} Tasks`}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No pending tasks found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;