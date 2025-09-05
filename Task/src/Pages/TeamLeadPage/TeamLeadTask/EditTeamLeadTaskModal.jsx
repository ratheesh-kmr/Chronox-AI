// src/components/TeamLead/EditTeamLeadTaskModal.jsx
import { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Edit,
  User,
  Calendar,
  Flag,
  FileText,
  Users,
  FolderOpen,
  AlertCircle,
  Repeat,
  Target,
  Clock
} from "lucide-react";
import Swal from "sweetalert2";
import { fetchProjects, fetchTeamsPublic, fetchUser, updateTask } from "../../../Services/services";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EditTeamLeadTaskModal({ task, teamLeadId, onClose, onUpdate, restrictToTeam = true }) {
  const modalRef = useRef();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLeadData, setTeamLeadData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);
  const [form, setForm] = useState({
    taskList: "",
    assignedTo: [],
    taskStartDate: "",
    taskEndDate: "",
    status: "ToDo",
    priority: "Medium",
    description: "",
    duration: "",
    recurrence: { type: "None" },
    recurrenceDates: [],
    projectName: "",
    teams: "",
  });

  const formatLocalDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Function to calculate date difference in days
  const calculateDateDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Function to check if task end date exceeds project duration
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

  // Function to calculate duration in hours considering task assignment time
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
      // Skip Sundays
      if (current.getDay() !== 0) {
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
      }

      current.setDate(current.getDate() + 1); // Move to next day
    }

    return `${(totalMinutes / 60).toFixed(1)}h`;
  };

  // Date validation function
  const validateDates = (startDate, endDate) => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end < start) {
        return "End date cannot be earlier than start date";
      }
    }
    return null;
  };

  // Handle click outside modal to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Load data and populate form with task data
  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, projectRes, teamRes] = await Promise.all([
          fetchUser(),
          fetchProjects(),
          fetchTeamsPublic(),
        ]);
        setUsers(userRes);
        setProjects(projectRes);
        setTeams(teamRes);

        let members = []; // Declare members variable here

        // Find team lead data and filter team members
        if (restrictToTeam && teamLeadId) {
          const teamLead = userRes.find(u => u._id === teamLeadId);
          setTeamLeadData(teamLead);

          if (teamLead && teamLead.team) {
            // Filter team members (including team lead)
            const teamId = teamLead.team._id || teamLead.team;
            members = userRes.filter(u => {
              const userTeamId = u.team?._id || u.team;
              return userTeamId === teamId;
            });
            console.log("Team members:", members);
            setTeamMembers(members);
          }
        }

        // Populate form with task data
        if (task) {
          const taskStartDate = task.taskStartDate ? new Date(task.taskStartDate).toISOString().split('T')[0] : "";
          const taskEndDate = task.taskEndDate ? new Date(task.taskEndDate).toISOString().split('T')[0] : "";

          setForm({
            taskList: task.taskList || "",
            assignedTo: Array.isArray(task.assignedTo) 
              ? task.assignedTo.map(user => user._id || user)
              : task.assignedTo ? [task.assignedTo._id || task.assignedTo] : [],
            taskStartDate: taskStartDate,
            taskEndDate: taskEndDate,
            status: task.status || "ToDo",
            priority: task.priority || "Medium",
            description: task.description || "",
            duration: task.duration || "",
            recurrence: task.recurrence || { type: "None" },
            recurrenceDates: task.recurrenceDates || [],
            projectName: task.projectName?._id || task.projectName || "",
            teams: task.teams?._id || task.teams || "",
          });

          // Load project members if project is selected
          if (task.projectName) {
            const projectId = task.projectName._id || task.projectName;
            const selectedProject = projectRes.find((p) => p._id === projectId);
            if (selectedProject) {
              const projectMembersList = userRes.filter((u) =>
                selectedProject.members?.some((m) => m._id === u._id || m === u._id)
              );

              if (restrictToTeam && members.length > 0) {
                const teamMemberIds = members.map(tm => tm._id);
                const filteredMembers = projectMembersList.filter(pm => 
                  teamMemberIds.includes(pm._id)
                );
                setProjectMembers(filteredMembers);
              } else {
                setProjectMembers(projectMembersList);
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        Swal.fire("Error", "Failed to load required data.", "error");
      }
    }
    loadData();
  }, [task, teamLeadId, restrictToTeam]);

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setForm((prev) => ({
      ...prev,
      projectName: projectId,
      assignedTo: [],
    }));

    if (!projectId) {
      setProjectMembers([]);
      return;
    }

    const selectedProject = projects.find((p) => p._id === projectId);
    if (selectedProject) {
      // Get project members who are also team members
      const projectMembersList = users.filter((u) =>
        selectedProject.members?.some((m) => m._id === u._id || m === u._id)
      );

      // If restricting to team, filter to only team members
      if (restrictToTeam && teamMembers.length > 0) {
        const teamMemberIds = teamMembers.map(tm => tm._id);
        const filteredMembers = projectMembersList.filter(pm => 
          teamMemberIds.includes(pm._id)
        );
        setProjectMembers(filteredMembers);
      } else {
        setProjectMembers(projectMembersList);
      }
    }
  };

  // When user is selected
  const handleUserChange = (e) => {
    const userId = e.target.value;
    const selectedUser = users.find((u) => u._id === userId);
    const teamId = selectedUser?.team?._id || selectedUser?.team || "";

    setForm((prev) => ({
      ...prev,
      assignedTo: [userId],
      teams: teamId,
    }));
  };

  // Updated DatePicker handlers
  const handleStartDateChange = (date) => {
    handleChange({
      target: {
        name: "taskStartDate",
        value: formatLocalDate(date),
      },
    });
  };

  const handleEndDateChange = (date) => {
    handleChange({
      target: {
        name: "taskEndDate",
        value: formatLocalDate(date),
      },
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("recurrence.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({
        ...prev,
        recurrence: { ...prev.recurrence, [key]: value },
      }));
      return;
    }

    // Handle date changes with proper duration calculation
    if (name === "taskStartDate" || name === "taskEndDate") {
      setForm((prev) => {
        const updatedForm = { ...prev, [name]: value };

        // Validate dates
        const dateError = validateDates(updatedForm.taskStartDate, updatedForm.taskEndDate);

        if (dateError) {
          Swal.fire({
            icon: 'warning',
            title: 'Invalid Date Range',
            text: dateError,
            showConfirmButton: false,
            timer: 2000
          });
        } else {
          // Calculate duration only if both dates are present and valid
          if (updatedForm.taskStartDate && updatedForm.taskEndDate) {
            updatedForm.duration = calculateWorkingDuration(
              updatedForm.taskStartDate,
              updatedForm.taskEndDate,
              true
            );
          } else {
            updatedForm.duration = "";
          }
        }

        return updatedForm;
      });
      return;
    }

    // Handle other form fields
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // helper to normalize ids
const toId = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (v._id) return toId(v._id);
    if (v.$oid) return v.$oid;
  }
  return ""; // fallback; prevents "[object Object]"
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const dateError = validateDates(form.taskStartDate, form.taskEndDate);
  if (dateError) {
    Swal.fire("Invalid Date Range", dateError, "error");
    return;
  }

  // Check project duration before proceeding
  const canProceed = await checkProjectDuration(form.taskEndDate, toId(form.projectName));
  if (!canProceed) return;

  setSaving(true);
  try {
    const taskId = toId(task?._id);

    if (!/^[a-f\d]{24}$/i.test(taskId)) {
      console.error("Invalid taskId:", taskId, task?._id);
      throw new Error("Invalid task id");
    }

    const updatePayload = {
      taskList: (form.taskList || "").trim(),
      assignedTo: (form.assignedTo || []).map(toId).filter(Boolean),
      taskStartDate: form.taskStartDate,
      taskEndDate: form.taskEndDate,
      status: form.status,
      priority: form.priority,
      description: (form.description || "").trim(),
      duration: form.duration,
      recurrence: form.recurrence,
      recurrenceDates: form.recurrenceDates,
      projectName: toId(form.projectName),
      teams: toId(form.teams),
    };

    console.log("Update payload:", JSON.stringify(updatePayload, null, 2));

    // ✅ pass id separately, not inside payload
    const response = await updateTask(taskId, updatePayload);
    console.log("Update response:", response);

    Swal.fire("Updated", "Team task updated successfully!", "success");
    onClose();
    onUpdate();
  } catch (error) {
    console.error("Task update error:", error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    }
    Swal.fire("Error", `Failed to update task: ${error.message || "Unknown error"}`, "error");
  } finally {
    setSaving(false);
  }
};


  const getTeamName = (teamId) => {
    if (!teamId) return "";
    const team = teams.find(t => t._id === teamId || t.id === teamId);
    return team ? team.name || team.teamName || teamId : teamId;
  };

  const recurrenceOptions = ["None", "Daily", "Weekly", "Monthly", "Yearly"];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "text-red-500";
      case "Medium": return "text-yellow-500";
      case "Low": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  // Get available assignees based on project selection and team restriction
  const getAvailableAssignees = () => {
    if (form.projectName && projectMembers.length > 0) {
      return projectMembers;
    } else if (restrictToTeam && teamMembers.length > 0) {
      return teamMembers;
    }
    return [];
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center px-4 py-6">
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-5xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]"
        style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold mb-5 text-gray-800 border-b pb-3 flex items-center gap-2">
          <Edit size={22} className="text-blue-600" /> Edit Team Task
          {restrictToTeam && teamLeadData && (
            <span className="text-sm font-normal text-gray-500">
              for {getTeamName(teamLeadData.team?._id || teamLeadData.team)} Team
            </span>
          )}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  <Target size={14} className="inline mr-1" /> Task Title
                </label>
                <input
                  type="text"
                  name="taskList"
                  value={form.taskList}
                  onChange={handleChange}
                  placeholder="Enter task title..."
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  <FolderOpen size={14} className="inline mr-1" /> Project
                </label>
                <select
                  name="projectName"
                  required
                  value={form.projectName}
                  onChange={handleProjectChange}
                  className="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.projectName}</option>
                  ))}
                </select>
              </div>

              {/* Assignee - restricted to team members */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  <User size={14} className="inline mr-1" /> Assignee
                  {restrictToTeam && (
                    <span className="text-xs text-blue-600 ml-1">(Team Members Only)</span>
                  )}
                </label>
                <select
                  name="assignedTo"
                  value={form.assignedTo[0] || ""}
                  onChange={handleUserChange}
                  required
                  className="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="">Select Team Member</option>
                  {getAvailableAssignees().map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} {u._id === teamLeadId ? "(You)" : ""}
                    </option>
                  ))}
                </select>
                {getAvailableAssignees().length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {form.projectName 
                      ? "No team members found in this project" 
                      : "Select a project to see available team members"
                    }
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  <Users size={14} className="inline mr-1" /> Team
                </label>
                <input
                  type="text"
                  value={getTeamName(form.teams)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md bg-gray-100 text-gray-500"
                  placeholder="Team (auto-filled based on assignee)"
                  readOnly
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  <FileText size={14} className="inline mr-1" /> Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter task description..."
                  rows={4}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* RIGHT: Dates, Status & Settings */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    <Calendar size={14} className="inline mr-1" /> Start Date
                  </label>
                  <DatePicker
                    selected={form.taskStartDate ? new Date(form.taskStartDate) : null}
                    onChange={handleStartDateChange}
                    dateFormat="dd-MM-yyyy"
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Select start date"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    <Calendar size={14} className="inline mr-1" /> End Date
                  </label>
                  <DatePicker
                    selected={form.taskEndDate ? new Date(form.taskEndDate) : null}
                    onChange={handleEndDateChange}
                    dateFormat="dd-MM-yyyy"
                    minDate={form.taskStartDate ? new Date(form.taskStartDate) : null}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Select end date"
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
                  placeholder="Auto-calculated from dates"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Duration calculated from current time (if assigned today) to end date
                </p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  <AlertCircle size={14} className="inline mr-1" /> Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="ToDo">To Do</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Upcoming">Upcoming</option>
                    <option value="OverDue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  <Flag size={14} className={`inline mr-1 ${getPriorityColor(form.priority)}`} /> Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">
                  <Repeat size={14} className="inline mr-1" /> Recurrence
                </label>
                <select
                  name="recurrence.type"
                  value={form.recurrence.type}
                  onChange={handleChange}
                  className="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {recurrenceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {form.recurrence.type !== "None" && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="recurrence.startDate"
                        value={form.recurrence.startDate || form.taskStartDate}
                        onChange={handleChange}
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">
                        Repeat Count
                      </label>
                      <input
                        type="number"
                        name="recurrence.repeatCount"
                        value={form.recurrence.repeatCount || ""}
                        onChange={handleChange}
                        min={1}
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter number of repeats"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto text-gray-600 hover:text-gray-800 px-6 py-2 rounded-md hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {saving ? "Updating..." : "Update Team Task"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}