import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import ProjectDescriptionEditor from "./ProjectDescriptionEditor";

import {
  fetchProjects,
  createProject,
  fetchTeamsPublic,
  fetchUser,
  deleteProject,
  updateProject,
} from "../../Services/services";
import {
  IconPlus,
  IconLayoutGrid,
  IconLayoutList,
  IconDots,
  IconEdit,
  IconTrash,
  IconCheck,
  IconStar,
  IconStarFilled,

} from "@tabler/icons-react";
import { format } from "date-fns";
import Loader from "../../Components/Loader/Loader";


const statusColors = {
  Active: "bg-purple-100 text-purple-800",
  Upcoming: "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-800",
  Delayed: "bg-red-200 text-Black",
};

const teamColors = [
  { bg: 'bg-purple-300', text: 'text-purple-800', bgLight: 'bg-purple-100', bgHover: 'hover:bg-purple-50', border: 'border-purple-300', bgSelected: 'bg-purple-200' },
  { bg: 'bg-blue-300', text: 'text-blue-800', bgLight: 'bg-blue-100', bgHover: 'hover:bg-blue-50', border: 'border-blue-300', bgSelected: 'bg-blue-200' },
  { bg: 'bg-green-300', text: 'text-green-800', bgLight: 'bg-green-100', bgHover: 'hover:bg-green-50', border: 'border-green-300', bgSelected: 'bg-green-200' },
  { bg: 'bg-red-300', text: 'text-red-800', bgLight: 'bg-red-100', bgHover: 'hover:bg-red-50', border: 'border-red-300', bgSelected: 'bg-red-200' },
  { bg: 'bg-yellow-300', text: 'text-yellow-800', bgLight: 'bg-yellow-100', bgHover: 'hover:bg-yellow-50', border: 'border-yellow-300', bgSelected: 'bg-yellow-200' },
  { bg: 'bg-indigo-300', text: 'text-indigo-800', bgLight: 'bg-indigo-100', bgHover: 'hover:bg-indigo-50', border: 'border-indigo-300', bgSelected: 'bg-indigo-200' },
  { bg: 'bg-pink-300', text: 'text-pink-800', bgLight: 'bg-pink-100', bgHover: 'hover:bg-pink-50', border: 'border-pink-300', bgSelected: 'bg-pink-200' },
  { bg: 'bg-teal-300', text: 'text-teal-800', bgLight: 'bg-teal-100', bgHover: 'hover:bg-teal-50', border: 'border-teal-300', bgSelected: 'bg-teal-200' },
];


const tabs = ["All", "Upcoming", "Active", "Completed", "Delayed"];

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [dateError, setDateError] = useState("");
  const [favoriteProjectIds, setFavoriteProjectIds] = useState([]);






  const [newProject, setNewProject] = useState({
    projectName: "",
    description: "",
    projectStartDate: "",
    projectDeliveryDate: "",
    projectDuration: "",
    teams: [],
    members: [],
    status: "Upcoming",
  });

  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);


  const loadProjects = async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
      setFilteredProjects(
        activeTab === "All" ? data : data.filter((p) => p.status === activeTab)
      );
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterProjectsByTab();
  }, [activeTab, projects]);

  const filterProjectsByTab = () => {
    if (activeTab === "All") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter((p) => p.status === activeTab));
    }
  };


  //---------project duration calculation----------
  const calcDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    if (s && e && !isNaN(s) && !isNaN(e)) {
      const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)); // in days
      return `${diff} day${diff !== 1 ? "s" : ""}`;
    }
    return "";
  };
  useEffect(() => {
    const { projectStartDate, projectDeliveryDate } = newProject;
    if (projectStartDate && projectDeliveryDate) {
      const duration = calcDuration(projectStartDate, projectDeliveryDate);
      setNewProject((prev) => ({ ...prev, projectDuration: duration }));
    }
  }, [newProject.projectStartDate, newProject.projectDeliveryDate]);

  //--------------create project------------

  const handleCreateProject = async (e) => {
    e.preventDefault();

    const { projectName, description, teams, members } = newProject;

    if (!projectName.trim()) {
      alert("Project name is required.");
      return;
    }

    if (!description || description.trim() === "" || description === "<p></p>") {
      alert("Description is required.");
      return;
    }

    if (!teams || teams.length === 0) {
      alert("Please select at least one team.");
      return;
    }

    if (!members || members.length === 0) {
      alert("Please select at least one member.");
      return;
    }

    try {
      const duration = calcDuration(newProject.projectStartDate, newProject.projectDeliveryDate);
      const payload = { ...newProject, projectDuration: duration };

      if (editingProject) {
        await updateProject(editingProject._id, payload);
      } else {
        await createProject(payload);
      }

      setShowModal(false);
      setEditingProject(null);
      setNewProject({
        projectName: "",
        description: "",
        projectStartDate: "",
        projectDeliveryDate: "",
        projectDuration: "",
        teams: [],
        members: [],
        status: "Upcoming",
      });
      await loadProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };


  //get the team color
  const getTeamColor = (teamIndex) => {
    return teamColors[teamIndex % teamColors.length];
  };

  // Function to get user's team color based on their team membership
  const getUserTeamColor = (user, teams, selectedTeamIds) => {
    // Find which selected team this user belongs to
    const userTeam = teams.find(team =>
      selectedTeamIds.includes(team._id) &&
      team.members && team.members.includes(user._id)
    );

    if (userTeam) {
      const teamIndex = teams.findIndex(team => team._id === userTeam._id);
      return getTeamColor(teamIndex);
    }

    // Default color if user doesn't belong to any selected team
    return { bg: 'bg-gray-300', text: 'text-gray-800', bgLight: 'bg-gray-100', bgHover: 'hover:bg-gray-50', border: 'border-gray-300', bgSelected: 'bg-gray-200' };
  };

  //-------------------- Create project with AI---------------

  // const handleCreateWithAI = async () => {
  //   try {
  //     const projectName = "AI-Powered Web Redesign";

  //     const res = await fetch("/api/ai/generateProjectDetails", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ projectName }),
  //     });

  //     const data = await res.json();

  //     if (!data.description || !data.teamId) {
  //       toast.error("AI couldn't generate project details.");
  //       return;
  //     }

  //     setEditingProject({
  //       projectName,
  //       description: data.description,
  //       teams: [data.teamId],
  //       members: [],
  //       status: "Upcoming",
  //     });

  //     setShowModal(true);
  //   } catch (err) {
  //     console.error("AI project generation failed:", err);
  //     toast.error("Failed to generate project with AI.");
  //   }
  // };

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setLoadingUsers(true);
        const [fetchedTeams, fetchedUsers] = await Promise.all([
          fetchTeamsPublic(),
          fetchUser(),
        ]);
        setTeams(fetchedTeams);
        setUsers(fetchedUsers);
        setLoadingUsers(false);
        if (fetchedTeams.length > 0) {
          setNewProject((prev) => ({ ...prev, teams: [fetchedTeams[0]._id] }));
        }
      } catch (err) {
        console.error("Failed to load teams/users", err);
        setLoadingUsers(false);
      }
    };

    loadDropdowns();
  }, []);




  //---------date validation-----------
  useEffect(() => {
    const { projectStartDate, projectDeliveryDate } = newProject;
    if (projectStartDate && projectDeliveryDate) {
      if (new Date(projectDeliveryDate) < new Date(projectStartDate)) {
        setDateError("Delivery date cannot be before Start date");
      } else {
        setDateError("");
        const duration = calcDuration(projectStartDate, projectDeliveryDate);
        setNewProject((prev) => ({ ...prev, projectDuration: duration }));
      }
    }
  }, [newProject.projectStartDate, newProject.projectDeliveryDate]);

  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        const formElement = document.getElementById("create-project-form");
        formElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100); // Slight delay to ensure render
    }
  }, [showModal]);


  // for edit modal
  const [actionMenuProjectId, setActionMenuProjectId] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  //-----------edit form----------
  useEffect(() => {
    if (editingProject && users.length > 0) {
      setNewProject({
        projectName: editingProject.projectName || "",
        description: editingProject.description || "",
        projectStartDate: editingProject.projectStartDate?.slice(0, 10) || "",
        projectDeliveryDate: editingProject.projectDeliveryDate?.slice(0, 10) || "",
        projectDuration: editingProject.projectDuration || "",
        teams: editingProject.teams?.map(t => t._id || t) || [],
        members: editingProject.members?.map(m => m._id || m) || [],
        status: editingProject.status || "Upcoming",
      });
    }
  }, [editingProject, users]);


  //--------------reset state on form close-----------
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setNewProject({
      projectName: "",
      description: "",
      projectStartDate: "",
      projectDeliveryDate: "",
      projectDuration: "",
      teams: [],
      members: [],
      status: "Upcoming",
    });
  };


  const filteredMembers = users.filter((u) =>
    newProject.teams.some(
      (teamId) =>
        (u.team?._id?.toString() || u.team?.toString()) === teamId.toString()
    )

  );
  //----------------favoriteProject-------------
  const toggleFavorite = (projectId) => {
    const updatedFavorites = favoriteProjectIds.includes(projectId)
      ? favoriteProjectIds.filter((id) => id !== projectId)
      : [...favoriteProjectIds, projectId];

    setFavoriteProjectIds(updatedFavorites);
    sessionStorage.setItem("favoriteProjectIds", JSON.stringify(updatedFavorites));
  };

  const favoriteProjects = projects.filter((project) =>
    favoriteProjectIds.includes(project._id)
  );

  useEffect(() => {
    const storedFavorites = sessionStorage.getItem("favoriteProjectIds");
    if (storedFavorites) {
      setFavoriteProjectIds(JSON.parse(storedFavorites));
    }
  }, []);


  //----------------Drop down menu-------------
  const actionMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target)
      ) {
        setActionMenuProjectId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //--------- Project navigation-------
  const navigate = useNavigate();




  return (
    <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-1">Projects Page</h1>
      <p className="text-gray-500 mb-6">
        Get started by selecting the content type from the option below
      </p>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => {
            setEditingProject(null);
            setNewProject({
              projectName: "",
              description: "",
              projectStartDate: "",
              projectDeliveryDate: "",
              projectDuration: "",
              teams: [],
              members: [],
              status: "Upcoming",
            });
            setShowModal(true);
          }}
          className="bg-purple-500 text-white rounded-xl shadow-xl p-4 flex items-center justify-center hover:bg-violet-700 transition"
        >
          <IconPlus className="mr-2" /> Create New Project
        </button>

        {favoriteProjects.length > 0 ? (
          favoriteProjects.map((project) => (
            <div
              key={project._id}
              className="relative group rounded-xl p-4 bg-purple-50 shadow-xl hover:shadow-lg transition overflow-visible z-0 cursor-pointer"
              onClick={() => navigate(`/ProjectPage/${project._id}`)}
              title="View Project Details"
            >
              <h3 className="font-semibold text-sm">{project.projectName}</h3>
              <p className="text-xs text-gray-600 mt-1">
                {project.projectDuration || "No duration"} | {project.status}
              </p>
            </div>
          ))
        ) : (
          <div className="rounded-xl p-4 bg-gray-100 text-gray-500 text-sm italic">
            No favorite projects yet.
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 transition-all">
        {/* Project Form */}
        {showModal && (
          <div
            id="create-project-form"
            className="w-full lg:w-3/4 bg-white rounded-2xl shadow-xl p-6 h-fit"
          >
            <form
              onSubmit={handleCreateProject}
              className="space-y-6 transition-all duration-300 transform animate-fade-in"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Create New Project
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Project Name & Duration */}
              <div className="flex flex-col lg:flex-row gap-4">
                <input
                  required
                  type="text"
                  placeholder="Project Name"
                  value={newProject.projectName}
                  onChange={(e) =>
                    setNewProject({ ...newProject, projectName: e.target.value })
                  }
                  className="flex-1 p-3 border border-gray-200 rounded-xl shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <input
                  type="text"
                  placeholder="Project Duration (auto fill)"
                  value={newProject.projectDuration}
                  readOnly
                  className="w-full lg:w-1/3 p-3 border rounded-xl bg-gray-100 cursor-not-allowed"
                />
              </div>

              {/* Dates with labels side-by-side */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newProject.projectStartDate}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        projectStartDate: e.target.value,
                      })
                    }
                    className="p-3 border border-gray-200 rounded-xl shadow-sm bg-white"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newProject.projectDeliveryDate}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        projectDeliveryDate: e.target.value,
                      })
                    }
                    className="p-3 border border-gray-200 rounded-xl shadow-sm bg-white"
                  />
                </div>
              </div>
              <ProjectDescriptionEditor
                value={newProject.description ? newProject.description.replace(/<[^>]+>/g, "") : ""}
                onChange={(val) => setNewProject({ ...newProject, description: val })}
              />

              {/* Teams select (multiple) */}
              {/* Teams (custom list with avatars and selection) */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Teams
                </label>
                <div className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm space-y-2">
  {teams.length > 0 ? (
    teams.map((team) => {
      const isSelected = newProject.teams.includes(team._id);
      return (
        <div
          key={team._id}
          onClick={() => {
            const updated = isSelected
              ? newProject.teams.filter((id) => id !== team._id)
              : [...newProject.teams, team._id];
            setNewProject({ ...newProject, teams: updated });
          }}
          className={`flex items-center justify-between space-x-3 px-3 py-1 rounded-lg shadow-sm cursor-pointer transition ${
            isSelected ? "bg-purple-300 text-purple-800" : "bg-gray-100 hover:bg-purple-50"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-300 text-white font-bold flex items-center justify-center text-sm uppercase">
              {team.teamName?.[0] || "?"}
            </div>
            <span className="text-sm font-medium">{team.teamName}</span>
          </div>
          {isSelected && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      );
    })
  ) : (
    <p className="text-gray-400 italic">No teams available</p>
  )}
</div>
              </div>


              {/* Team Members (auto list, based on selected team) */}
              {/* Selectable Members */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Members
                </label>
                <div className="w-full p-3 border border-gray-200 rounded-xl h-36 overflow-y-auto bg-white shadow-sm space-y-3">
                  {loadingUsers ? (
                    <div className="flex justify-center items-center w-full">
                      <Loader />
                    </div>
                  ) : filteredMembers.length > 0 ? (
                    // Group members by teams and render each team separately
                    (() => {
                      // Group members by their teams
                      const membersByTeam = {};
                      const membersWithoutTeam = [];




                      filteredMembers.forEach((user) => {
                        // Try backend-provided team first (object or id)
                        let userTeam =
                          (user.team && typeof user.team === "object" ? user.team : null) ||
                          teams.find(t => t._id?.toString() === (user.team?._id || user.team)?.toString()) ||
                          // Fallback: infer by membership array (normalize ids/objects)
                          teams.find(t =>
                            t.members?.some(m => (m?._id || m)?.toString() === user._id?.toString())
                          ) ||
                          null;

                        if (userTeam) {
                          if (!membersByTeam[userTeam._id]) {
                            membersByTeam[userTeam._id] = { team: userTeam, members: [] };
                          }
                          membersByTeam[userTeam._id].members.push({ ...user, team: userTeam });
                        } else {
                          membersWithoutTeam.push({ ...user, team: null });
                        }
                      });


                      const teamGroups = Object.values(membersByTeam);

                      return (
                        <div className="space-y-3">
                          {teamGroups.map((group, index) => (
                            <div key={group.team._id}>
                              {/* Team Header */}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 rounded-full bg-purple-300 text-white font-bold flex items-center justify-center text-xs uppercase">
                                  {group.team.teamName?.[0] || "?"}
                                </div>
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  {group.team.teamName}
                                </h4>
                              </div>

                              {/* Team Members */}
                              <div className="flex flex-wrap gap-2 mb-2">
                                {group.members.map((user) => {
                                  const isSelected = newProject.members.includes(user._id);


                                  return (
                                    <button
                                      key={user._id}
                                      type="button"
                                      onClick={() => {
                                        setNewProject((prev) => ({
                                          ...prev,
                                          members: isSelected
                                            ? prev.members.filter((id) => id !== user._id)
                                            : [...prev.members, user._id],
                                        }));
                                      }}
                                      className={`flex items-center gap-2 px-3 py-1 rounded-2xl text-sm font-medium border ${isSelected
                                        ? "bg-purple-200 text-purple-800 border-purple-300"
                                        : "bg-gray-100 text-gray-700 border-gray-200"
                                        } hover:shadow transition`}
                                    >
                                      <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-semibold uppercase">
                                        {user.name.charAt(0)}
                                      </div>
                                      <div className="flex flex-col items-start">
                                        <span>{user.name}</span>
                                        <span className="text-xs text-gray-500">
                                          {user.team?.teamName}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Separator line (except for the last team) */}
                              {index < teamGroups.length - 1 && (
                                <hr className="border-gray-200 my-2" />
                              )}
                            </div>
                          ))}

                          {/* Members without teams */}
                          {membersWithoutTeam.length > 0 && (
                            <div>
                              {teamGroups.length > 0 && <hr className="border-gray-200 my-2" />}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 rounded-full bg-gray-400 text-white font-bold flex items-center justify-center text-xs">
                                  ?
                                </div>
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                  No Team
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {membersWithoutTeam.map((user) => {
                                  const isSelected = newProject.members.includes(user._id);
                                  console.log("data:", user);
                                  return (
                                    <button
                                      key={user._id}
                                      type="button"
                                      onClick={() => {
                                        setNewProject((prev) => ({
                                          ...prev,
                                          members: isSelected
                                            ? prev.members.filter((id) => id !== user._id)
                                            : [...prev.members, user._id],
                                        }));
                                      }}
                                      className={`flex items-center gap-2 px-3 py-1 rounded-2xl text-sm font-medium border ${isSelected
                                        ? "bg-purple-200 text-purple-800 border-purple-300"
                                        : "bg-gray-100 text-gray-700 border-gray-200"
                                        } hover:shadow transition`}
                                    >
                                      <div className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-semibold uppercase">
                                        {user.name.charAt(0)}
                                      </div>
                                      <div className="flex flex-col items-start">
                                        <span>{user.name}</span>
                                        <span className="text-xs text-gray-500">
                                          <span>{user.team?.teamName}</span>
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-gray-400 italic">No members found</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white shadow-sm"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Completed">Delayed</option>

                </select>
              </div>


              {/* Actions */}
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm rounded-xl bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  Create Project
                </button>

              </div>
            </form>

          </div>
        )}


        {/* Project List Container */}
        <div className={`flex-1 transition-opacity ${showModal ? "opacity-30 lg:opacity-100" : ""}`}>
          {/* Tabs & Controls */}
          <div className="flex items-center justify-between mb-4 mt-4">
           <div className="flex flex-wrap gap-2 sm:space-x-3">
  {tabs.map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        activeTab === tab ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-600"
      }`}
    >
      {tab}
    </button>
  ))}
</div>

            <div className="flex items-center space-x-2 text-gray-500">
              <IconLayoutGrid
                onClick={() => setViewMode("grid")}
                className={`cursor-pointer hover:text-gray-800 ${viewMode === "grid" ? "text-gray-800" : ""}`}
              />
              <IconLayoutList
                onClick={() => setViewMode("list")}
                className={`cursor-pointer hover:text-gray-800 ${viewMode === "list" ? "text-gray-800" : ""}`}
              />
            </div>
          </div>

          {/* Projects View */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/ProjectPage/${project._id}`)}
                  className="relative group rounded-xl p-4 bg-purple-50 shadow-xl hover:shadow-lg transition overflow-hidden cursor-pointer"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(project._id);
                    }}
                    className="absolute bottom-3 right-3 z-20 text-yellow-400 hover:scale-110 transition-transform"
                    aria-label="Favorite"
                  >
                    {favoriteProjectIds.includes(project._id) ? <IconStarFilled size={26} /> : <IconStar size={24} />}
                  </button>

                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{project.projectName}</h4>
                    <div className="relative z-50 top-0.5 left-1 " onClick={(e) => e.stopPropagation()} >
                      <IconDots
                        className="h-7 w-7 text-gray-500 cursor-pointer"
                        onClick={() =>
                          setActionMenuProjectId((prev) => (prev === project._id ? null : project._id))
                        }
                      />
                      {actionMenuProjectId === project._id && (
                        <div
                          ref={actionMenuRef}
                          className="absolute z-50 w-44 bg-white border-1 shadow-xl rounded-xl right-0 top-full mt-2"
                        >
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setNewProject({
                                projectName: project.projectName || "",
                                description: project.description || "",
                                projectStartDate: project.projectStartDate?.slice(0, 10) || "",
                                projectDeliveryDate: project.projectDeliveryDate?.slice(0, 10) || "",
                                projectDuration: project.projectDuration || "",
                                teams: project.teams?.map(t => t._id || t) || [],
                                members: project.members?.map(m => m._id || m) || [],
                                status: project.status || "Upcoming",
                              });
                              setShowModal(true);
                              setActionMenuProjectId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            <IconEdit className="w-4 h-4 text-gray-500" />
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this project?")) {
                                await deleteProject(project._id);
                                await loadProjects();
                              }
                              setActionMenuProjectId(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                          >
                            <IconTrash className="w-4 h-4" />
                            Delete
                          </button>
                          {project.status !== "Completed" && (
                            <button
                              onClick={async () => {
                                await updateProject(project._id, { status: "Completed" });
                                await loadProjects();
                                setActionMenuProjectId(null);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100"
                            >
                              <IconCheck className="w-4 h-4 text-green-600" />
                              Completed
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className="text-sm text-gray-500 mb-2 line-clamp-2"
                    dangerouslySetInnerHTML={{
                      __html: project.description || "<i>No description available</i>",
                    }}
                  />

                  <p className="text-xs text-gray-400">
                    Start: {project.projectStartDate ? format(new Date(project.projectStartDate), "PP") : "N/A"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Delivery: {project.projectDeliveryDate ? format(new Date(project.projectDeliveryDate), "PP") : "N/A"}
                  </p>
                  <span
                    className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || "bg-yellow-300 text-gray-700"
                      }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow rounded-xl overflow-x-auto border">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border">
                    <th className="px-4 py-2">Project</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Created At</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr
                      key={project._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/project/${project._id}`)}
                    >
                      <td className="px-4 py-2">{project.projectName}</td>
                      <td className="px-4 py-2">
                        <div
                          className="text-sm text-gray-500"
                          dangerouslySetInnerHTML={{
                            __html: project.description || "<i>No description</i>",
                          }}
                        />
                      </td>
                      <td className="px-4 py-2">{format(new Date(project.createdAt), "PPpp")}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || "bg-yellow-500 text-gray-700"
                            }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            setNewProject({
                              projectName: project.projectName || "",
                              description: project.description || "",
                              projectStartDate: project.projectStartDate?.slice(0, 10) || "",
                              projectDeliveryDate: project.projectDeliveryDate?.slice(0, 10) || "",
                              projectDuration: project.projectDuration || "",
                              teams: project.teams?.map(t => t._id || t) || [],
                              members: project.members?.map(m => m._id || m) || [],
                              status: project.status || "Upcoming",
                            });
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Are you sure?")) {
                              await deleteProject(project._id);
                              await loadProjects();
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <IconTrash size={18} />
                        </button>
                        {project.status !== "Completed" && (
                          <button
                            onClick={async () => {
                              await updateProject(project._id, { status: "Completed" });
                              await loadProjects();
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Mark as Completed"
                          >
                            <IconCheck size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
