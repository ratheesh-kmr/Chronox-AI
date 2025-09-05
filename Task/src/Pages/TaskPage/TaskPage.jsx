import React, { useEffect, useState } from "react";
import {
  fetchTasks,
  fetchTaskById,
  fetchUser,
  fetchProjects,
} from "../../Services/services";
import TaskGridView from "./TaskGridView";
import TaskTableView from "./TaskTableView";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import { Button } from "../../Components/UI/Button/Button";
import { Table, LayoutGrid, KanbanSquare, RefreshCcw } from "lucide-react";
import KanbanBoard from "./KanbanBoard";

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    project: "",
    user: "",
    status: "",
  });
  const [rotating, setRotating] = useState(false);
  const [projectMembers, setProjectMembers] = useState([]);


  const filteredTasks = tasks.filter((task) => {
    const matchProject = filters.project ? task.projectName?._id === filters.project : true;
    const matchUser = filters.user
      ? task.assignedTo?.some((user) => user._id === filters.user)
      : true;
    const matchStatus = filters.status ? task.status === filters.status : true;
    return matchProject && matchUser && matchStatus;

  });

  const filteredUsers = filters.project
    ? users.filter((user) =>
      projects
        .find((proj) => proj._id === filters.project)
        ?.assignedUsers?.some((assigned) => assigned._id === user._id)
    )
    : users;




  const getTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const loadInitialData = async () => {
    try {
      const [tasksData, usersData, projectsData] = await Promise.all([
        fetchTasks(),
        fetchUser(),
        fetchProjects(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
      setProjects(projectsData);
    } catch (err) {
      console.error("Error loading initial data:", err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleEdit = async (task) => {
    try {
      const fullTask = await fetchTaskById(task._id);
      setSelectedTask(fullTask);
      setEditModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch task details", err);
    }
  };

  const handleRefresh = () => {
    setRotating(true);
    getTasks();
    setTimeout(() => setRotating(false), 500);
  };


  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">Tasks</h1>
        <span className="text-l text-gray-500">
          Manage and view your tasks here
        </span>
      </div>
      <div className="flex justify-between items-start flex-col md:flex-row md:items-center gap-4">


        {/* Filters Panel */}
        <div className="flex flex-wrap gap-3 max-w-full rounded-xl p-3">
          {/* Project Filter */}
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium text-gray-700">Project</label>
            <select
              value={filters.project}
              onChange={(e) => {
                const selectedProjectId = e.target.value;
                setFilters((prev) => ({ ...prev, project: selectedProjectId }));

                if (!selectedProjectId) {
                  setProjectMembers([]); // reset if "All"
                } else {
                  const selectedProject = projects.find(p => p._id === selectedProjectId);
                  setProjectMembers(selectedProject?.members || []);
                }
              }}
              className="border border-gray-300 px-3 py-1.5 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-40"
            >
              <option value="">All</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName}
                </option>
              ))}
            </select>

          </div>

          {/* User Filter */}
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium text-gray-700">User</label>
            <select
              value={filters.user}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, user: e.target.value }))
              }
              className="border border-gray-300 px-3 py-1.5 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">All</option>
              {(filters.project ? projectMembers : filteredUsers).map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>

          </div>

          {/* Status Filter */}
          <div className="flex flex-col text-sm">
            <label className="mb-1 font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="border border-gray-300 px-3 py-1.5 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              <option value="">All</option>
              <option value="ToDo">To Do</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="OverDue">Overdue</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex flex-col justify-end ">
            <Button
              variant="ghost"
              className="px-3 py-1.5 text-sm text-white bg-purple-700 rounded hover:bg-purple-800"
              onClick={() =>
                setFilters({ project: "", user: "", status: "" })
              }
            >
              Clear
            </Button>
          </div>
        </div>

        {/* View & Actions */}
        <div className="flex items-center gap-2 pt-6 min-w-max">
          <Button onClick={() => setShowModal(true)}>Create Task</Button>




          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={20} />
          </Button>

          <Button
            variant={viewMode === "kanban" ? "default" : "ghost"}
            onClick={() => setViewMode("kanban")}
          >
            <KanbanSquare size={20} />
          </Button>

          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            onClick={() => setViewMode("table")}
          >
            <Table size={20} />
          </Button>
        </div>
      </div>


      {viewMode === "grid" && (
        <TaskGridView tasks={filteredTasks} onEdit={handleEdit} onTaskUpdate={getTasks} />
      )}

      {viewMode === "table" && (
        <TaskTableView tasks={filteredTasks} onEdit={handleEdit} onTaskUpdate={getTasks} />
      )}

      {viewMode === "kanban" && (
        <KanbanBoard tasks={filteredTasks} onTaskUpdate={getTasks} onEdit={handleEdit} />
      )}

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onTaskCreated={() => {
            getTasks();
            setShowModal(false);
          }}
        />
      )}

      {editModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          users={users}
          projects={projects}
          onClose={() => setEditModalOpen(false)}
          onUpdate={() => {
            getTasks();
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
