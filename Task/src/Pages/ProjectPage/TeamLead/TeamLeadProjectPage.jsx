import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProjectsByTeamLead, fetchProjectsOfTeammates } from "../../../Services/teamLeadServices";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";

export default function TeamLeadProjectsPage() {
  const [viewMode, setViewMode] = useState("grid");
  const [expandedId, setExpandedId] = useState(null);
  const userId = sessionStorage.getItem("userId");

  const [myProjects, setMyProjects] = useState([]);
  const [teamProjects, setTeamProjects] = useState([]);

  // Fetch my projects + teammate projects
  const getProjectsForLeadAndTeam = async () => {
    if (!userId) return;
    try {
      // Fetch my projects
      const myProjectsData = await fetchProjectsByTeamLead(userId);
      setMyProjects(myProjectsData || []);

      // Fetch team projects
      const teamProjectsData = await fetchProjectsOfTeammates(userId);
      setTeamProjects(teamProjectsData || []);
    } catch (err) {
      console.error("Failed to fetch projects for lead and team", err);
    }
  };

  useEffect(() => {
    getProjectsForLeadAndTeam();
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
          dangerouslySetInnerHTML={{
            __html: project.description || "<i>No description provided.</i>",
          }}
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
              <div>
                <strong>Team Members:</strong>{" "}
                {Array.isArray(project.members) && project.members.length > 0
                  ? project.members.map((m) => m?.name).join(", ")
                  : "No members"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderProjectList = (projectsList) => {
    if (projectsList.length === 0) {
      return (
        <div className="rounded-xl p-4 bg-gray-100 text-gray-500 text-sm italic flex items-center justify-center h-32">
          No projects found.
        </div>
      );
    }

    switch (viewMode) {
      case "grid":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsList.map(renderProjectCard)}
          </div>
        );
      case "list":
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-purple-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Project Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Delivery Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Members
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectsList.map((project) => (
                  <tr
                    key={project._id}
                    className="hover:bg-purple-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[project.status] ||
                          "bg-yellow-300 text-gray-700"
                        }`}
                      >
                        {project.status || "In Progress"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.projectStartDate
                        ? new Date(project.projectStartDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.projectDeliveryDate
                        ? new Date(project.projectDeliveryDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Array.isArray(project.members) &&
                      project.members.length > 0
                        ? project.members.map((m) => m?.name).join(", ")
                        : "No members"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">Team Lead Projects</h1>
      <p className="text-gray-500 mb-6">
        View projects assigned to you and your teammates
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

      {/* My Projects */}
      <h2 className="text-xl font-semibold mt-6 mb-2">My Projects</h2>
      {renderProjectList(myProjects)}

      {/* Team Projects */}
      <h2 className="text-xl font-semibold mt-10 mb-2">Team Projects</h2>
      {renderProjectList(teamProjects)}
    </div>
  );
}
