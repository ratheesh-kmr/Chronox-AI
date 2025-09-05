import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchMilestonesByProject,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  fetchProjectTasks,
  fetchProjectById,
} from "../../Services/services";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Trash2,
  Pencil,
  Save,
  ArrowLeftCircle,
  Columns,
  Flag,
  List,
  PlusCircle,
  Plus,
  Calendar,
  XCircle,
} from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import CreateTaskModal from "../TaskPage/CreateTaskModal";

// Helper function for date formatting
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

// Helper function to get status-based colors for milestones
const getStatusColors = (status) => {
  switch (status) {
    case "Completed":
      return { bg: "bg-green-500", text: "text-green-500" };
    case "In Progress":
      return { bg: "bg-blue-500", text: "text-blue-500" };
    case "Delayed":
      return { bg: "bg-red-500", text: "text-red-500" };
    case "Upcoming":
    default:
      return { bg: "bg-yellow-500", text: "text-yellow-500" };
  }
};

// Helper function to get status-based colors for tasks
const getTaskStatusColors = (status) => {
  switch (status) {
    case "Completed":
      return "bg-green-500";
    case "In Progress":
      return "bg-blue-500";
    case "Delayed":
      return "bg-red-500";
    case "Pending":
    default:
      return "bg-yellow-500";
  }
};

// Component for the milestone creation/edit form
function MilestoneForm({
  form,
  setForm,
  tasks,
  isEditing,
  onSave,
  onClose,
  setShowCreateTaskModal,
  projectStartDate,
  projectDeliveryDate,
}) {
  const handleSaveClick = () => {
    if (new Date(form.startDate) < new Date(projectStartDate)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Milestone Date",
        text: `Milestone start date (${formatDate(form.startDate)}) cannot be before the project start date (${formatDate(projectStartDate)}).`,
        confirmButtonColor: "#7c3aed",
      });
      return;
    }
    if (new Date(form.endDate) > new Date(projectDeliveryDate)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Milestone Date",
        text: `Milestone end date (${formatDate(form.endDate)}) cannot exceed the project end date (${formatDate(projectDeliveryDate)}).`,
        confirmButtonColor: "#7c3aed",
      });
      return;
    }
    onSave();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white p-8 rounded-lg shadow-2xl border border-gray-200 w-full max-w-2xl mx-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XCircle size={24} />
        </button>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">
          {isEditing ? "Edit Milestone" : "Create New Milestone"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <label className="block">
            <span className="text-gray-700">Milestone Name</span>
            <input
              type="text"
              placeholder="e.g., Phase 1 Completion"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Start Date</span>
            <input
              type="date"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-gray-700">End Date</span>
            <input
              type="date"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-colors"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </label>
          <div className="block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Associated Tasks</span>
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(true)}
                className="flex items-center gap-1 text-purple-600 text-sm hover:text-purple-700 transition-colors"
              >
                <Plus size={16} />
                Create Task
              </button>
            </div>
            <Select
              isMulti
              options={tasks}
              value={form.task}
              onChange={(selected) => setForm({ ...form, task: selected })}
              className="mt-1"
              placeholder="Select tasks for this milestone..."
              noOptionsMessage={() => "No tasks available. Create a task first!"}
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#D1D5DB",
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: "#A78BFA",
                  },
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: "#EBE9FE",
                  color: "#6B46C1",
                }),
              }}
            />
          </div>
        </div>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            <Save size={16} /> {isEditing ? "Update Milestone" : "Create Milestone"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Component for the timeline view
function TimelineView({ milestones, onEdit, onDelete, allTasks }) {
  const [openMilestones, setOpenMilestones] = useState({});

  const toggleAccordion = (id) => {
    setOpenMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getMilestoneStatus = (milestone) => {
    const now = new Date();
    const startDate = new Date(milestone.startDate);
    const endDate = new Date(milestone.endDate);

    if (milestone.status === "Completed") return "Completed";
    if (now > endDate) return "Delayed";
    if (now >= startDate && now <= endDate) return "In Progress";
    return "Upcoming";
  };

  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  return (
    <div className="relative border-l-4 border-gray-200 ml-4 pl-8 space-y-8">
      {sortedMilestones.length === 0 ? (
        <p className="text-gray-500">No milestones to display.</p>
      ) : (
        sortedMilestones.map((ms) => {
          const status = getMilestoneStatus(ms);
          const colors = getStatusColors(status);
          const isOpen = openMilestones[ms._id];

          return (
            <motion.div
              key={ms._id}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute -left-10 top-2 z-10 flex items-center gap-2">
                <div
                  className={`w-6 h-6 ${colors.bg} rounded-full flex items-center justify-center text-white shadow-lg mr-5`}
                >
                  <Flag size={14} />
                </div>
                <span
                  className={`text-sm font-semibold ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                >
                  {status}
                </span>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-600 transform transition-transform duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl">
                <div
                  className="flex justify-between items-center cursor-pointer mb-2"
                  onClick={() => toggleAccordion(ms._id)}
                >
                  <h3 className="text-2xl font-bold text-gray-800">{ms.name}</h3>
                </div>

                <div className="text-gray-600 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span>
                    {formatDate(ms.startDate)} → {formatDate(ms.endDate)}
                  </span>
                </div>

                <div className="flex space-x-2 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(ms);
                    }}
                    className="text-purple-600 p-2 rounded-full hover:bg-purple-100 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(ms._id);
                    }}
                    className="text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                          <List size={16} className="text-purple-400" />
                          Associated Tasks ({ms.task.length})
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          {ms.task.length > 0 ? (
                            ms.task.map((taskId) => {
                                const task = allTasks.find(t => t._id === taskId._id);
                                return task ? (
                                    <li
                                        key={task._id}
                                        className="flex justify-between items-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                                    >
                                        {/* Left side: task info */}
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-800">{task.taskList}</span>
                                            <span className="text-xs text-gray-500">
                                                Due:{" "}
                                                {task.taskEndDate
                                                    ? new Date(task.taskEndDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                      })
                                                    : "N/A"}
                                            </span>
                                            {task.assignedTo?.length > 0 && (
                                                <span className="text-xs text-gray-500">
                                                    Assignee: {task.assignedTo.map((u) => u.name).join(", ")}
                                                </span>
                                            )}
                                        </div>

                                        {/* Right side: status */}
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full font-semibold ${getTaskStatusColors(
                                                task.status
                                            )} text-white`}
                                        >
                                            {task.status || "Pending"}
                                        </span>
                                    </li>
                                ) : null;
                            })
                          ) : (
                            <li className="text-gray-500">No tasks linked.</li>
                          )}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

// Main MilestonesPage Component
export default function MilestonesPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    task: [],
  });

  const loadData = async () => {
    try {
      const [milestoneData, taskData, proj] = await Promise.all([
        fetchMilestonesByProject(projectId),
        fetchProjectTasks(projectId),
        fetchProjectById(projectId),
      ]);

      setProject(proj);
      setMilestones(milestoneData.milestones || []);
      setTasks(
        (taskData || []).map((t) => ({
          label: t.taskList,
          value: t._id,
          status: t.status,
        }))
      );
    } catch {
      toast.error("Failed to load data.");
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const validateForm = () => {
    if (!form.name || !form.startDate || !form.endDate) {
      toast.error("Missing fields");
      return false;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error("End date cannot be before start date");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const payload = {
      ...form,
      project: projectId,
      task: form.task.map((t) => t.value),
    };
    try {
      if (isEditing) {
        await updateMilestone(editId, payload);
        toast.success("Milestone updated successfully!");
      } else {
        await createMilestone(payload);
        toast.success("Milestone created successfully!");
      }
      resetForm();
      loadData();
    } catch (error) {
      toast.error("Save failed. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this milestone?")) return;
    try {
      await deleteMilestone(id);
      toast.success("Milestone deleted successfully!");
      loadData();
    } catch (error) {
      toast.error("Delete failed. Please try again.");
    }
  };

  const handleEdit = (milestone) => {
    setForm({
      name: milestone.name,
      startDate: milestone.startDate.slice(0, 10),
      endDate: milestone.endDate.slice(0, 10),
      task: milestone.task.map((t) => ({
        label: t.taskList,
        value: t._id,
        status: t.status,
      })),
    });
    setIsEditing(true);
    setEditId(milestone._id);
    setShowFormModal(true);
  };

  const resetForm = () => {
    setForm({ name: "", startDate: "", endDate: "", task: [] });
    setIsEditing(false);
    setEditId(null);
    setShowFormModal(false);
  };

  const handleTaskCreated = async () => {
    await loadData();
    toast.success(
      "Task created successfully! You can now add it to your milestone."
    );
  };

  return (
    <div className="p-6 mx-auto bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl">
      <button
        className="flex items-center gap-2 text-purple-700 mb-4 hover:text-purple-900 transition-colors"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftCircle size={20} />
        Back to Project
      </button>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-bold text-gray-800"> Project Milestones – {project?.name}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowFormModal(true);
            }}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            <PlusCircle size={20} /> Create Milestone
          </button>
        </div>
      </div>

      <TimelineView
        milestones={milestones}
        onEdit={handleEdit}
        onDelete={handleDelete}
        allTasks={milestones.flatMap(ms => ms.task)}
      />

      <AnimatePresence>
        {showFormModal && (
          <MilestoneForm
            form={form}
            setForm={setForm}
            tasks={tasks}
            isEditing={isEditing}
            onSave={handleSave}
            onClose={resetForm}
            setShowCreateTaskModal={setShowCreateTaskModal}
            projectStartDate={project?.startDate}
            projectDeliveryDate={project?.projectDeliveryDate}
          />
        )}
      </AnimatePresence>

      {showCreateTaskModal && (
        <CreateTaskModal
          onClose={() => setShowCreateTaskModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}