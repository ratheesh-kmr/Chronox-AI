import React, { useEffect, useState } from "react";
import {
  fetchTaskById,
  fetchTasksByUser,
} from "../../../Services/services";
import EmployeeTaskGridView from "./EmployeeTaskGridView.jsx";
import EmployeeTaskTableView from "./EmployeeTaskTableView.jsx";
import KanbanBoard from "./EmployeeKanbanBoard.jsx";
import { Button } from "../../../Components/UI/Button/Button";
import {
  Table,
  LayoutGrid,
  KanbanSquare,
  RefreshCcw,
} from "lucide-react";

export default function EmployeeTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const userId = sessionStorage.getItem("userId");

  const getTasksForUser = async () => {
    if (!userId) return;
    try {
      const userTasks = await fetchTasksByUser(userId);
      setTasks(userTasks);
    } catch (err) {
      console.error("Failed to fetch user tasks", err);
    }
  };

  useEffect(() => {
    getTasksForUser();
  }, [userId]);

  const handleEdit = async (task) => {
    try {
      const fullTask = await fetchTaskById(task._id);
      setSelectedTask(fullTask);
      setEditModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch task details", err);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Tasks</h1>
          <span className="text-l text-gray-500">
            View and manage your assigned tasks
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={getTasksForUser} title="Refresh Tasks">
            <RefreshCcw size={20} />
          </Button>
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
        <EmployeeTaskGridView tasks={tasks} onEdit={handleEdit} onTaskUpdate={getTasksForUser} />
      )}

      {viewMode === "table" && (
        <EmployeeTaskTableView tasks={tasks} onEdit={handleEdit} onTaskUpdate={getTasksForUser} />
      )}

      {viewMode === "kanban" && (
        <KanbanBoard tasks={tasks} onTaskUpdate={getTasksForUser} onEdit={handleEdit} />
      )}

      {/* {editModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          users={users}
          projects={projects}
          onClose={() => setEditModalOpen(false)}
          onUpdate={() => {
            getTasksForUser();
            setEditModalOpen(false);
          }}
        />
      )} */}
    </div>
  );
}