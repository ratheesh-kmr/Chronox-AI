import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchTeams,
  deleteTeam,
  createTeam,
  updateTeam,
  fetchUnassignedUsers,
  assignMembersToTeam,
} from "../../Services/services";
import TeamFormModal from "./TeamFormModal";
import AddMembersModal from "./AddMembersModal";
import TeamSettingsModal from "./TeamSettingsModal";
import Swal from "sweetalert2";
import { Plus, Users, Crown, UserPlus, Grid, Settings } from "lucide-react";
import { IconTrash } from "@tabler/icons-react";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const teamColors = [
    "#8F87F1", 
    "#C68EFD",
    "#E9A5F1",
    "#FED2E2",
    "#FFB6B9",
    "#FDCB6E",
    "#A0E7E5",
    "#B4F8C8",
    "#FFAEBC",
    "#C1C8E4",
  ];

  const navigate = useNavigate();


  const openSettings = (team) => {
    setSelectedTeam(team);
    setShowSettings(true);
  };

  const totalTeams = teams.length;
  const totalMembers = teams.reduce(
    (sum, team) => sum + (team.members?.length || 0),
    0
  );
  const totalLeads = teams.reduce(
    (sum, team) => sum + (team.teamLeader ? 1 : 0),
    0
  );

  const handleCreate = () => {
    setEditingTeam(null);
    setShowModal(true);
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingTeam?._id) {
        const updated = await updateTeam(editingTeam._id, formData);
        setTeams((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      } else {
        const created = await createTeam(formData);
        setTeams((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch {
      Swal.fire("Error", "Could not save team", "error");
    }
  };

  const handleDelete = async (id) => {
    const res = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the team.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (res.isConfirmed) {
      try {
        await deleteTeam(id);
        Swal.fire("Deleted!", "Team has been deleted.", "success");
        await loadTeams();
      } catch {
        Swal.fire("Error", "Failed to delete team.", "error");
      }
    }
  };

  const handleAddMembers = async (teamId) => {
    try {
      const unassigned = await fetchUnassignedUsers();
      setUnassignedUsers(unassigned);
      setSelectedTeamId(teamId);
      setShowAddMembersModal(true);
    } catch {
      Swal.fire("Error", "Failed to fetch unassigned users", "error");
    }
  };

  const handleAssignMembers = async (memberIds) => {
    try {
      await assignMembersToTeam(selectedTeamId, memberIds);
      Swal.fire("Success", "Members added successfully", "success");
      const updatedTeams = await fetchTeams();
      setTeams(updatedTeams);
      setShowAddMembersModal(false);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error || "Failed to assign members", "error");
    }
  };

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await fetchTeams();
      setTeams(data);
    } catch {
      setError("Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const filteredTeams = useMemo(
    () => teams.filter((t) => t.teamName.toLowerCase().includes(searchTerm.toLowerCase())),
    [teams, searchTerm]
  );

  const colorMap = useMemo(() => {
    const map = {};
    filteredTeams.forEach((team, index) => {
      map[team._id] = teamColors[index % teamColors.length];
    });
    return map;
  }, [filteredTeams]);


  return (
    <div className="p-6 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 min-h-screen rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
          <p className="text-gray-600 text-sm">Create and manage your project teams</p>
        </div>
        <div className="flex gap-3 items-center flex-wrap">
          <button
            onClick={handleCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer"
          >
            <Plus size={16} /> Create New Team
          </button>
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-50 bg-white rounded-lg  focus:shadow-xl focus:outline-none  text-sm hover:shadow-xl"
          />
        </div>
      </div>

      {/* Error */}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Grid */}
      {loading ? (
        <div className="h-32 flex justify-center items-center">
          <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">No teams found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredTeams.map((team) => (
            <div key={team._id} className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition-all"
              onClick={() => navigate(`/teams/${team._id}`)}
            >

              <div className="flex justify-between mb-3 items-start">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: colorMap[team._id] || "#8F87F1" }}
                  >
                    {team.teamName?.[0] || "T"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.teamName}</h3>

                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openSettings(team);
                  }}
                >
                  <Settings className="text-gray-500 w-5 h-5 cursor-pointer" />
                </button>

              </div>

              {/* <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {team.teamDescription || ""}
              </p> */}

              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Team Lead:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Crown size={14} className="text-yellow-500" />
                    {team.teamLeader?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Members:</span>
                  <span
                    className="font-medium cursor-help"
                    title={
                      team.members?.length
                        ? team.members.map((m) => m.name).join(", ")
                        : "No members assigned"
                    }
                  >
                    {team.members?.length || 0}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 ">
                <button

                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddMembers(team._id);
                  }}
                  className=" border-gray-200 bg-purple-50 text-purple-600 px-3 py-2 rounded text-sm flex items-center justify-center gap-2 hover:bg-purple-100"
                >
                  <UserPlus size={14} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(team._id)
                  }}
                  className=" px-3 py-2 rounded text-sm hover:bg-red-50 text-red-600"
                >
                  <IconTrash size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <TeamFormModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        initialData={editingTeam}
      />
      {showSettings && selectedTeam && (
        <TeamSettingsModal
          team={selectedTeam}
          onClose={() => setShowSettings(false)}
          onUpdate={loadTeams}
        />
      )}
      {showAddMembersModal && (
        <AddMembersModal
          users={unassignedUsers}
          onClose={() => setShowAddMembersModal(false)}
          onAssign={handleAssignMembers}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-7 sm:text-xl">
        <StatCard icon={<Users />} label="Total Teams" value={totalTeams} />
        <StatCard icon={<Users />} label="Team Members" value={totalMembers} />
        {/* <StatCard icon={<Grid />} label="Active Projects" value={6} /> */}
        <StatCard icon={<Crown />} label="Team Leads" value={totalLeads} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="p-4 flex items-center gap-4 ">
      <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">{icon}</div>
      <div>
        <h4 className="font-semibold">{value}</h4>
        <p className="text-gray-500 text-sm sm:text-xs">{label}</p>
      </div>
    </div>
  );
}
