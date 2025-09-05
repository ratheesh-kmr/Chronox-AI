import React, { useEffect, useState } from "react";
import { fetchProjects } from "../../Services/services";
import { useNavigate } from "react-router-dom";
import {
  IconFolderOpen,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MilestoneHandlerPage() {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("newest"); // 'newest' or 'oldest'
  const navigate = useNavigate();

  useEffect(() => {
    const getProjects = async () => {
      try {
        const res = await fetchProjects();
        setProjects(res || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    getProjects();
  }, []);

  const handleProjectClick = (projectId) => {
    navigate(`/MilestonesPage/${projectId}`);
  };

  const filteredAndSortedProjects = projects
    .filter((project) => {
      const query = searchQuery.toLowerCase();
      const projectName = (project.projectName || project.name || "").toLowerCase();
      const description = (project.description || "").toLowerCase();
      return projectName.includes(query) || description.includes(query);
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      if (dateFilter === "newest") {
        return dateB - dateA;
      }
      return dateA - dateB;
    });

  return (
    <motion.div
      className="p-6 min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl text-purple-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-extrabold mb-8 text-center text-purple-800">
        Milestone Management
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Select a project to view and manage its milestones.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
          />
          <IconSearch
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <label htmlFor="date-filter" className="text-gray-700 font-medium">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="appearance-none pr-8 py-2 p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              {dateFilter === "newest" ? (
                <IconSortDescending size={20} />
              ) : (
                <IconSortAscending size={20} />
              )}
            </div>
          </div>
        </div>
      </div>

      {filteredAndSortedProjects.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 text-lg">No projects match your search.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredAndSortedProjects.map((project) => (
              <motion.div
                key={project._id}
                onClick={() => handleProjectClick(project._id)}
                className="cursor-pointer bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start gap-4">
                  <IconFolderOpen size={32} className="text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {project.projectName || project.name}
                    </h2>
                    <p
                      className="text-gray-600 text-sm mt-1 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: project.description || "<i>No description provided.</i>",
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}