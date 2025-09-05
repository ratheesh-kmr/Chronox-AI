import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const statusColors = {
  "TO DO": "bg-gray-200 text-gray-800",
  "IN PROGRESS": "bg-yellow-100 text-yellow-800",
  "IN REVIEW": "bg-purple-100 text-purple-800",
  "COMPLETED": "bg-green-100 text-green-800",
  "BLOCKED": "bg-red-100 text-red-800",
  // Add more statuses and colors as needed
};


export default function TaskTableView({ tasks, onEdit, onDelete }) {
  // Get the user's role from session storage
  const userRole = sessionStorage.getItem("role");

  // Determine if the user can manage (edit/delete) tasks
  const canManageTasks = userRole !== "EMPLOYEE" && userRole !== "TEAM_LEAD";

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Task</th>
            <th className="p-3 text-left">Assigned To</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Priority</th>
            <th className="p-3 text-left">Start Date</th>
            <th className="p-3 text-left">End Date</th>
            {canManageTasks && <th className="p-3 text-left">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const statusStyle =
              statusColors[task.status?.toUpperCase()] ||
              "bg-indigo-100 text-indigo-700"; // default

            return (
              <tr key={task._id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-800">{task.taskList}</td>
                <td className="p-3 text-gray-700">
                  {Array.isArray(task.assignedTo)
                    ? task.assignedTo.map((user) => user?.name).filter(Boolean).join(", ")
                    : "Unassigned"}
                </td>
                <td className="p-3">
                  <span className={`inline-block text-xs px-2 py-1 rounded ${statusStyle}`}>
                    {task.status}
                  </span>
                </td>
                <td className="p-3 text-gray-700">{task.priority || "None"}</td>
                <td className="p-3 text-gray-600">
                  {task.taskStartDate ? new Date(task.taskStartDate).toLocaleDateString() : "—"}
                </td>
                <td className="p-3 text-gray-600">
                  {task.taskEndDate ? new Date(task.taskEndDate).toLocaleDateString() : "—"}
                </td>
                {canManageTasks && (
                  <td className="p-3 flex space-x-2">
                    <button
                      onClick={() => onEdit(task)}
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(task._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}