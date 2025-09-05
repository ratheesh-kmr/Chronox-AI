import React, { useEffect, useRef, useState } from "react";
import {
  X,
  User,
  Target,
  FolderOpen,
  Users,
  Calendar,
  AlertCircle,
  Flag,
  FileText,
  Clock,
  Repeat,
} from "lucide-react";
import { fetchProjects, fetchTeamsPublic, fetchUser, updateTask } from "../../Services/services";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function EditTaskModal({ onClose, task, onUpdate }) {
  const modalRef = useRef();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [userProjects, setUserProjects] = useState([]);

  const [form, setForm] = useState({
    taskList: "",
    assignedTo: [],
    taskStartDate: "",
    taskEndDate: "",
    status: "ToDo",
    priority: "Medium",
    description: "",
    duration: "",
    recurrence: { type: "None", startDate: "", repeatCount: "" },
    recurrenceDates: [],
    project: "",
    team: "",
  });

  const generateRecurrenceDates = (type, startDateStr, count) => {
    const dates = [];
    let baseDate = new Date(startDateStr);

    for (let i = 0; i < count; i++) {
      const nextDate = new Date(baseDate);

      if (type === "Daily") nextDate.setDate(baseDate.getDate() + i);
      else if (type === "Weekly") nextDate.setDate(baseDate.getDate() + i * 7);
      else if (type === "Monthly") nextDate.setMonth(baseDate.getMonth() + i);
      else if (type === "Yearly") nextDate.setFullYear(baseDate.getFullYear() + i);

      dates.push(nextDate.toISOString().split("T")[0]);
    }

    return dates;
  };

  const calculateDateDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const checkProjectDuration = async (taskEndDate, projectId) => {
    if (!projectId || !taskEndDate) return true;

    const selectedProject = projects.find(p => p._id === projectId);
    if (!selectedProject) return true;

    // Check if project has duration/end date
    const projectEndDate = selectedProject.projectEndDate || selectedProject.projectDeliveryDate;
    if (!projectEndDate) return true;

    const taskEnd = new Date(taskEndDate);
    const projEnd = new Date(projectEndDate);

    if (taskEnd > projEnd) {
      const additionalDays = calculateDateDifference(projectEndDate, taskEndDate);

      const result = await Swal.fire({
        title: 'Task End Date Exceeds Project Duration',
        text: `The task end date exceeds the project duration by ${additionalDays} days. Do you wish to extend the project duration?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, extend project',
        cancelButtonText: 'No, change task date'
      });

      return result.isConfirmed;
    }

    return true;
  };

  const calculateWorkingDuration = (start, end, isTaskAssignmentTime = false) => {
    if (!start || !end) return "0h";

    const WORK_START_HOUR = 9;
    const WORK_START_MIN = 30;
    const WORK_END_HOUR = 17;
    const WORK_END_MIN = 30;

    const isSameLocalDate = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    const toLocalDateOnly = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    let startDate, endDate;

    if (isTaskAssignmentTime) {
      const today = new Date();
      const startDateOnly = toLocalDateOnly(start);

      if (isSameLocalDate(startDateOnly, today)) {
        startDate = new Date();
      } else {
        startDate = new Date(start);
        startDate.setHours(WORK_START_HOUR, WORK_START_MIN, 0, 0);
      }

      endDate = new Date(end);
      const endDateOnly = toLocalDateOnly(end);

      if (isSameLocalDate(endDateOnly, today)) {
        const endOfWorkDay = new Date();
        endOfWorkDay.setHours(WORK_END_HOUR, WORK_END_MIN, 0, 0);
        endDate = endOfWorkDay;
      } else {
        endDate.setHours(WORK_END_HOUR, WORK_END_MIN, 0, 0);
      }
    } else {
      startDate = new Date(start);
      endDate = new Date(end);
    }

    if (isNaN(startDate) || isNaN(endDate)) return "0h";
    if (endDate < startDate) return "0h";

    let totalMinutes = 0;

    const getWorkDayBounds = (date) => {
      const startOfDay = new Date(date);
      startOfDay.setHours(WORK_START_HOUR, WORK_START_MIN, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(WORK_END_HOUR, WORK_END_MIN, 0, 0);
      return { startOfDay, endOfDay };
    };

    let current = toLocalDateOnly(startDate);
    const endDateOnly = toLocalDateOnly(endDate);

    while (current <= endDateOnly) {
      const { startOfDay, endOfDay } = getWorkDayBounds(current);

      if (isSameLocalDate(current, startDate)) {
        let actualStart;
        if (isTaskAssignmentTime && isSameLocalDate(current, new Date())) {
          const now = new Date();
          actualStart = now > startOfDay ? now : startOfDay;
        } else {
          actualStart = startDate > startOfDay ? startDate : startOfDay;
        }

        const actualEnd = isSameLocalDate(current, endDateOnly)
          ? (endDate < endOfDay ? endDate : endOfDay)
          : endOfDay;

        if (actualEnd > actualStart) {
          totalMinutes += (actualEnd - actualStart) / 60000;
        }
      } else if (isSameLocalDate(current, endDateOnly)) {
        const actualEnd = endDate < endOfDay ? endDate : endOfDay;
        if (actualEnd > startOfDay) {
          totalMinutes += (actualEnd - startOfDay) / 60000;
        }
      } else {
        totalMinutes += (endOfDay - startOfDay) / 60000;
      }

      current.setDate(current.getDate() + 1);
    }

    return `${(totalMinutes / 60).toFixed(1)}h`;
  };

  useEffect(() => {
    async function loadData() {
      const [userRes, projectRes, teamRes] = await Promise.all([
        fetchUser(),
        fetchProjects(),
        fetchTeamsPublic(),
      ]);
      setUsers(userRes);
      setProjects(projectRes);
      setTeams(teamRes);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (task && projects.length > 0) {
      console.log("Form data:", task);
      const assignedUser = task.assignedTo?.[0]?._id || task.assignedTo?.[0] || "";
      const userRelatedProjects = projects.filter((p) =>
        p.members?.some((u) => u._id === assignedUser || u === assignedUser)
      );

      const taskProject = projects.find(
        (p) => p._id === task.project?._id || p._id === task.project
      );

      if (taskProject && !userRelatedProjects.some((p) => p._id === taskProject._id)) {
        userRelatedProjects.push(taskProject);
      }

      setUserProjects(userRelatedProjects);

      setForm({
        taskList: task.taskList || "",
        assignedTo: [assignedUser],
        taskStartDate: task.taskStartDate?.split("T")[0] || "",
        taskEndDate: task.taskEndDate?.split("T")[0] || "",
        status: task.status || "ToDo",
        priority: task.priority || "Medium",
        description: task.description || "",
        duration: task.duration || "",
        recurrence: {
          type: task.recurrence?.type || "None",
          startDate:
            task.recurrence?.startDate?.split("T")[0] ||
            task.taskStartDate?.split("T")[0] ||
            new Date().toISOString().split("T")[0],
          repeatCount: task.recurrence?.repeatCount || "",
        },
        recurrenceDates: task.recurrenceDates || [],
        project: task.projectName?._id || task.projectName || "",
        team: task.teamName?._id || task.team || "",
      });
    }
  }, [task, projects]);

  useEffect(() => {
    // This effect runs whenever the start or end date changes
    if (form.taskStartDate && form.taskEndDate) {
      const newDuration = calculateWorkingDuration(form.taskStartDate, form.taskEndDate, true);
      setForm((prev) => ({ ...prev, duration: newDuration }));
    } else {
      setForm((prev) => ({ ...prev, duration: "0h" }));
    }
  }, [form.taskStartDate, form.taskEndDate]);

  const handleUserChange = (e) => {
    const userId = e.target.value;
    const selectedUser = users.find((u) => u._id === userId);
    const userRelatedProjects = projects.filter((p) =>
      p.members?.some((u) => u._id === userId || u === userId)
    );
    const teamId = selectedUser?.team?._id || selectedUser?.team || "";
    setUserProjects(userRelatedProjects);
    setForm((prev) => ({
      ...prev,
      assignedTo: [userId],
      team: teamId,
      project: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("recurrence.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        recurrence: { ...prev.recurrence, [key]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const start = new Date(form.taskStartDate);
    const end = new Date(form.taskEndDate);

    if (start > end) {
      Swal.fire("Invalid Dates", "Start date cannot be after end date.", "error");
      return;
    }

    // Check project duration before proceeding
    const canProceed = await checkProjectDuration(form.taskEndDate, form.project);
    if (!canProceed) {
      return; // User chose not to extend project, so don't proceed with task creation
    }

    if (form.recurrence.type !== "None") {
      const { startDate, repeatCount, type } = form.recurrence;

      if (!startDate || !repeatCount || isNaN(Number(repeatCount)) || Number(repeatCount) <= 0) {
        Swal.fire("Invalid Recurrence", "Please enter a valid start date and a repeat count > 0.", "warning");
        return;
      }

      const recurrenceDates = generateRecurrenceDates(type, startDate, Number(repeatCount));
      form.recurrence.recurrenceDates = recurrenceDates;
      form.recurrence.repeatCount = Number(repeatCount);
    } else {
      form.recurrence = { type: "None", startDate: "", repeatCount: "", recurrenceDates: [] };
    }

    try {
      await updateTask(task._id, form);
      toast.success("Task updated successfully");
      onClose();
      onUpdate();

    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update task");
    }
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          ref={modalRef}
          className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh]"
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Target size={20} className="text-blue-600" /> Edit Task
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <X />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Target size={14} /> Task Title
                </label>
                <input
                  name="taskList"
                  value={form.taskList}
                  onChange={handleChange}
                  placeholder="Task Title"
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <User size={14} /> Assignee
                </label>
                <select
                  name="assignedTo"
                  value={form.assignedTo[0] || ""}
                  onChange={handleUserChange}
                  required
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="">Select Assignee</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id} >
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FolderOpen size={14} /> Project
                </label>
                <select
                  name="project"
                  value={form.project}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  <option value="">Select Project</option>
                  {userProjects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Users size={14} /> Team
                </label>
                <input
                  type="text"
                  readOnly
                  className="w-full border p-2 rounded bg-gray-100 text-gray-500"
                  placeholder={teams.find((t) => t._id === form.team)?.teamName || "Auto filled"}
                  value={teams.find((t) => t._id === form.team)?.teamName || ""}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <FileText size={14} /> Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Description"
                  className="w-full border border-gray-300 p-2 rounded resize-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Calendar size={14} /> Start Date
                  </label>
                  <input
                    type="date"
                    name="taskStartDate"
                    value={form.taskStartDate}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Calendar size={14} /> End Date
                  </label>
                  <input
                    type="date"
                    name="taskEndDate"
                    value={form.taskEndDate}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  <Clock size={14} className="inline mr-1" /> Duration (Hours)
                </label>
                <input
                  type="text"
                  value={form.duration || ""}
                  readOnly
                  className="w-full border border-gray-300 px-4 py-2 rounded-md bg-gray-100 text-gray-500"
                  placeholder="Auto-calculated from assignment time"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Duration calculated from current time (if assigned today) to end date
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <AlertCircle size={14} /> Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  {["ToDo", "InProgress", "OverDue", "Completed", "Upcoming"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Flag size={14} /> Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  {["High", "Medium", "Low"].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Repeat size={14} /> Recurrence
                </label>
                <select
                  name="recurrence.type"
                  value={form.recurrence.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded"
                >
                  {["None", "Daily", "Weekly", "Monthly", "Yearly"].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {form.recurrence.type !== "None" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Recurrence Start Date</label>
                    <input
                      type="date"
                      name="recurrence.startDate"
                      value={form.recurrence.startDate}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 p-2 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Repeat Count</label>
                    <input
                      type="number"
                      min="1"
                      name="recurrence.repeatCount"
                      value={form.recurrence.repeatCount}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 p-2 rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="col-span-1 lg:col-span-2 flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}