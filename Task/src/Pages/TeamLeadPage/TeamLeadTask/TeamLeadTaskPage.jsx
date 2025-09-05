import React, { useEffect, useState } from "react";
import {
  fetchTasksByTeamLead,
  fetchTaskById,
} from "../../../Services/teamLeadServices.jsx";
import TeamLeadTaskGridView from "./TeamLeadGridView.jsx";
import TeamLeadTaskTableView from "./TeamLeadTableView.jsx";
import TeamLeadKanbanBoard from "./TeamLeadKanban.jsx";
import CreateTeamLeadTaskModal from "./CreateTeamLeadTaskModal.jsx";
import EditTeamLeadTaskModal from "./EditTeamLeadTaskModal.jsx";
import { Button } from "../../../Components/UI/Button/Button.jsx";
import { Table, LayoutGrid, KanbanSquare, RefreshCcw, Plus, Users, TrendingUp } from "lucide-react";

export default function TeamLeadTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterMembers, setFilterMembers] = useState("all");


  const teamLeadId = sessionStorage.getItem("userId");

  const getTasksForTeam = async () => {
    if (!teamLeadId) return;
    setLoading(true);
    try {
      const teamTasks = await fetchTasksByTeamLead(teamLeadId);
      setTasks(teamTasks);
    } catch (err) {
      console.error("Failed to fetch team tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasksForTeam();
  }, [teamLeadId]);

  const handleEdit = async (task) => {
    try {
      const fullTask = await fetchTaskById(task._id);
      setSelectedTask(fullTask);
      setEditModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch task details", err);
    }
  };

  const handleCreateTask = () => {
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = () => {
    getTasksForTeam();
  };

  // Filter tasks based on status and priority
  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (filterStatus !== "all") {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter(task => task.priority === filterPriority);
    }

    if (filterMembers !== "all") {
  filtered = filtered.filter(task =>
    Array.isArray(task.assignedTo) &&
    task.assignedTo.some(user => user?._id === filterMembers)
  );
}


    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Task statistics
  const getTaskStats = () => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'ToDo').length,
      inProgress: tasks.filter(t => t.status === 'InProgress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      upcoming: tasks.filter(t => t.status === 'Upcoming').length,
      OverDue: tasks.filter(t => t.status === 'OverDue').length,
      highPriority: tasks.filter(t => t.priority === 'High').length,
    };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="p-4 space-y-4 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading team tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">

            Team Tasks Management
          </h1>
          <span className="text-l text-gray-500">
            Create, assign and monitor tasks for your team members
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="default"
            onClick={handleCreateTask}
            className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg text-white w-30 h-10 flex items-center justify-center"
          >
            <Plus size={20} className="mr-1" />
            New Task
          </Button>
          <Button variant="ghost" onClick={getTasksForTeam} title="Refresh Tasks">
            <RefreshCcw size={20} />
          </Button>
          <div className="border-l border-gray-300 mx-2 h-6"></div>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            <LayoutGrid size={20} />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "ghost"}
            onClick={() => setViewMode("kanban")}
            title="Kanban View"
          >
            <KanbanSquare size={20} />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            <Table size={20} />
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">To Do</p>
              <p className="text-2xl font-bold text-blue-900">{stats.todo}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4 shadow-sm border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">In Progress</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.inProgress}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 shadow-sm border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Completed</p>
              <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Upcoming</p>
              <p className="text-2xl font-bold text-purple-900">{stats.upcoming}</p>
            </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 shadow-sm border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide">High Priority</p>
              <p className="text-2xl font-bold text-red-900">{stats.highPriority}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600 uppercase tracking-wide">Overdue</p>
              <p className="text-2xl font-bold text-orange-900">{stats.overdue}</p>
            </div>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="ToDo">To Do</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Upcoming">Upcoming</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Priority:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
  <label className="text-sm font-medium text-gray-700">Members:</label>
  <select
    value={filterMembers}
    onChange={(e) => setFilterMembers(e.target.value)}
    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="all">All Members</option>
    {tasks
      .flatMap(task => task.assignedTo || [])
      .filter((user, index, self) => user && index === self.findIndex(u => u._id === user._id)) // unique
      .map(user => (
        <option key={user._id} value={user._id}>
          {user.name}
        </option>
      ))}
  </select>
</div>


        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
        </div>
      </div>

      {/* Task Views */}
      {viewMode === "grid" && (
        <TeamLeadTaskGridView
          tasks={filteredTasks}
          onEdit={handleEdit}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {viewMode === "table" && (
        <TeamLeadTaskTableView
          tasks={filteredTasks}
          onEdit={handleEdit}
          onTaskUpdate={handleTaskUpdate}
        />
      )}

      {viewMode === "kanban" && (
        <TeamLeadKanbanBoard
          tasks={filteredTasks}
          onTaskUpdate={handleTaskUpdate}
          onEdit={handleEdit}
        />
      )}

      {/* Create Team Task Modal */}
      {createModalOpen && (
        <CreateTeamLeadTaskModal
          teamLeadId={teamLeadId}
          onClose={handleCloseCreateModal}
          onUpdate={handleTaskUpdate}
          restrictToTeam={true} // Only allow assignment to team members
        />
      )}

      {/* Edit Team Task Modal */}
      {editModalOpen && selectedTask && (
        <EditTeamLeadTaskModal
          task={selectedTask}
          teamLeadId={teamLeadId}
          onClose={handleCloseEditModal}
          onUpdate={handleTaskUpdate}
          restrictToTeam={true} // Only allow reassignment to team members
        />
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No Team Tasks Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first team task to get started with task management.
            </p>
            <Button onClick={handleCreateTask} variant="default">
              <Plus size={20} className="mr-2" />
              Create First Team Task
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}