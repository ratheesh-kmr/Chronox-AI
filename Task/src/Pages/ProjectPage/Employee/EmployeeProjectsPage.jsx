import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProjectsByUser } from "../../../Services/services";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";

export default function EmployeeProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [expandedId, setExpandedId] = useState(null); // track expanded project
  const userId = sessionStorage.getItem("userId");

  const getProjectsForUser = async () => {
    if (!userId) return;
    try {
      const userProjects = await fetchProjectsByUser(userId);
      setProjects(userProjects.projects || []);
    } catch (err) {
      console.error("Failed to fetch user projects", err);
    }
  };

  useEffect(() => {
    getProjectsForUser();
  }, [userId]);

  const statusColors = {
    Active: "bg-purple-100 text-purple-800",
    Upcoming: "bg-yellow-100 text-yellow-800",
    Completed: "bg-green-100 text-green-800",
    Delayed: "bg-red-200 text-black",
  };

  const toggleExpand = (projectId) => {
    setExpandedId((prev) => (prev === projectId ? null : projectId));
  };

  const renderProjectCard = (project) => {
    const isExpanded = expandedId === project._id;
    return (
      <div
        key={project._id}
        className="rounded-xl p-4 bg-purple-50 shadow-xl hover:shadow-lg transition cursor-pointer"
        onClick={() => toggleExpand(project._id)}
      >
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold">{project.projectName}</h4>
          <span
            className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
              statusColors[project.status] || "bg-yellow-300 text-gray-700"
            }`}
          >
            {project.status || "In Progress"}
          </span>
        </div>

       <p
        className="text-gray-600"
        dangerouslySetInnerHTML={{ __html: project.description || "<i>No description provided.</i>" }}
      />

        <p className="text-xs text-gray-400">
          Start:{" "}
          {project.projectStartDate
            ? new Date(project.projectStartDate).toLocaleDateString()
            : "N/A"}
        </p>
        <p className="text-xs text-gray-400">
          Delivery:{" "}
          {project.projectDeliveryDate
            ? new Date(project.projectDeliveryDate).toLocaleDateString()
            : "N/A"}
        </p>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="expanded"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 border-t pt-3 text-sm text-gray-700 space-y-2"
            >
              <div>
                <strong>Created At:</strong>{" "}
                {project.createdAt
                  ? new Date(project.createdAt).toLocaleString()
                  : "N/A"}
              </div>
              <div>
                <strong>Last Updated:</strong>{" "}
                {project.updatedAt
                  ? new Date(project.updatedAt).toLocaleString()
                  : "N/A"}
              </div>
             
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderProjectTable = () => {
  // Use this array to define your table columns and headers
  const columns = [
    { key: "projectName", label: "Project Name" },
    { key: "status", label: "Status" },
    { key: "projectStartDate", label: "Start Date" },
    { key: "projectDeliveryDate", label: "Delivery Date" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-purple-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project._id} className="hover:bg-purple-50 transition-colors duration-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {project.projectName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    statusColors[project.status] || "bg-yellow-300 text-gray-700"
                  }`}
                >
                  {project.status || "In Progress"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {project.projectDeliveryDate ? new Date(project.projectDeliveryDate).toLocaleDateString() : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
 const renderView = () => {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl p-4 bg-gray-100 text-gray-500 text-sm italic flex items-center justify-center h-64">
        You are not assigned to any projects.
      </div>
    );
  }

  switch (viewMode) {
    case "grid":
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(renderProjectCard)}
        </div>
      );
    case "list":
      return renderProjectTable(); // Render the new table view
    default:
      return null;
  }
};

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">My Projects</h1>
      <p className="text-gray-500 mb-6">
        View and manage your assigned projects
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 mt-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <IconLayoutGrid
            onClick={() => setViewMode("grid")}
            className={`cursor-pointer hover:text-gray-800 ${
              viewMode === "grid" ? "text-gray-800" : ""
            }`}
          />
          <IconLayoutList
            onClick={() => setViewMode("list")}
            className={`cursor-pointer hover:text-gray-800 ${
              viewMode === "list" ? "text-gray-800" : ""
            }`}
          />
        </div>
      </div>

      <div className="mt-6">{renderView()}</div>
    </div>
  );
}
