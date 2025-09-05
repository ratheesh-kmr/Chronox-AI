import React from "react";

const statusColors = {
  "TO DO": "bg-gray-200 text-gray-800",
  "IN PROGRESS": "bg-yellow-100 text-yellow-800",
  "IN REVIEW": "bg-purple-100 text-purple-800",
  "COMPLETED": "bg-green-100 text-green-800",
  "BLOCKED": "bg-red-100 text-red-800",
  "OVERDUE": "bg-red-200 text-red-900 font-semibold", // 🔥 overdue
};

const extensionColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  NONE: "bg-gray-100 text-gray-600",
};

export default function EmployeeTaskTableView({ tasks }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3 text-left">Task</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Priority</th>
            <th className="p-3 text-left">Start Date</th>
            <th className="p-3 text-left">End Date</th>
            <th className="p-3 text-left">Extension</th> {/* ✅ New column */}
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const statusStyle =
              statusColors[task.status?.toUpperCase()] ||
              "bg-indigo-100 text-indigo-700";

            const extensionStatus = task.extensionRequest?.status || "NONE";
            const extensionStyle = extensionColors[extensionStatus];

            return (
              <tr
                key={task._id}
                className={`border-t hover:bg-gray-50 ${
                  task.status === "OverDue" ? "bg-red-50" : ""
                }`} // 🔥 full row tint for overdue
              >
                <td className="p-3 font-medium text-gray-800">{task.taskList}</td>
                <td className="p-3">
                  <span className={`inline-block text-xs px-2 py-1 rounded ${statusStyle}`}>
                    {task.status}
                  </span>
                </td>
                <td className="p-3 text-gray-700">{task.priority || "None"}</td>
                <td className="p-3 text-gray-600">
                  {task.taskStartDate
                    ? new Date(task.taskStartDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-3 text-gray-600">
                  {task.taskEndDate
                    ? new Date(task.taskEndDate).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-3">
                  {extensionStatus !== "NONE" ? (
                    <span
                      className={`inline-block text-xs px-2 py-1 rounded ${extensionStyle}`}
                    >
                      {extensionStatus}{" "}
                      {task.extensionRequest?.requestedEndDate &&
                        `→ ${new Date(
                          task.extensionRequest.requestedEndDate
                        ).toLocaleDateString()}`}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs">No Request</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
