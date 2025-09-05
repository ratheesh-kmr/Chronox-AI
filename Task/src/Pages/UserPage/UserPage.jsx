import React, { useEffect, useState, useMemo } from "react";
import { fetchUser, deleteUser, updateUser, fetchTeamsPublic } from "../../Services/services";
import Swal from "sweetalert2";
import UserCardSimple from "./UserCard";
import InlineUserEditForm from "./UserFormModal";
import { motion, AnimatePresence } from "framer-motion";
import { Table, LayoutGrid } from "lucide-react";
import UserTableView from "./UserTable";

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("card");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [openUserId, setOpenUserId] = useState(null);

  const handleToggle = (id) => {
    setOpenUserId((prevId) => (prevId === id ? null : id));
  };


  const getUsers = async () => {
    try {
      const data = await fetchUser();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => setEditData(user);

  const handleSubmit = async (formData) => {
    try {
      await updateUser(formData._id, formData);
      await getUsers();
      Swal.fire("Success", "User updated successfully", "success");
      setEditData(null);
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("Error", "Failed to update user.", "error");
    }
  };


  const handleDelete = async (userId) => {
    const confirm = await Swal.fire({
      title: "Delete User?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Yes, delete it",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteUser(userId);
        setUsers((prev) => prev.filter((user) => user._id !== userId));
        Swal.fire("Deleted!", "User has been deleted.", "success");
        await getUsers();
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error", err?.response?.data?.message || "Failed to delete user.", "error");
      }
    }
  };


  useEffect(() => {
    getUsers();
  }, []);

  const [teams, setTeams] = useState([]);

  const getTeams = async () => {
    try {
      const data = await fetchTeamsPublic();
      setTeams(data);
    } catch (error) {
      console.error("Error loading teams:", error);
    }
  };

  useEffect(() => {
    getUsers();
    getTeams();
  }, []);


  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole ? user.role === selectedRole : true;
      const matchesTeam = selectedTeam
        ? teams.find((t) => t._id === user.team)?.teamName === selectedTeam
        : true;
      return matchesSearch && matchesRole && matchesTeam;
    });
  }, [users, searchTerm, selectedRole, selectedTeam, teams]); // Added `teams` to dependency array

  if (loading) return <div className="p-4 text-gray-700">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

return (
  <div className="relative min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 p-4 sm:p-6 rounded-xl">
    {/* Header and Controls */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      {/* Title Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 text-sm">Manage users across teams</p>
      </div>

      {/* Filter and View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        {/* Search and Select Filters */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm hover:shadow-md"
          />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm"
          >
            <option value="">All Roles</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="TEAM_LEAD">Team Lead</option>
            <option value="PROJECT_LEAD">Project Lead</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm"
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team._id} value={team.teamName}>
                {team.teamName}
              </option>
            ))}
          </select>
        </div>

        {/* Clear and View Buttons */}
        <div className="flex gap-3 mt-2 sm:mt-0">
          {/* Clear Filters Button */}
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedRole("");
              setSelectedTeam("");
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            Clear Filters
          </button>
          
          <div className="flex gap-1">
            <button
              onClick={() => setViewType("card")}
              className={`p-2 rounded-lg ${viewType === "card"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600"
                }`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewType("table")}
              className={`p-2 rounded-lg ${viewType === "table"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600"
                }`}
            >
              <Table size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content Area */}
    <div className={`flex flex-col sm:flex-row gap-4 md:flex-row ${editData ? "w-full" : ""}`}>
      {viewType === "card" ? (
        <div
          className={`grid gap-4 transition-all duration-500 ${editData ? "w-full sm:w-3/5" : "w-full"} grid-cols-1 xs:grid-cols-2 ${editData ? "lg:grid-cols-2" : "lg:grid-cols-3"} `}
        >
          {filteredUsers.map((user) => (
            <UserCardSimple
              key={user._id}
              user={{
                ...user,
                teamName: teams.find((t) => t._id === user.team)?.teamName || "No Team",
              }}
              isOpen={openUserId === user._id}
              onToggle={() => handleToggle(user._id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <UserTableView
            users={filteredUsers.map((user) => ({
              ...user,
              teamName: teams.find((t) => t._id === user.team)?.teamName || "No Team",
            }))}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Edit Form Sidebar */}
      <AnimatePresence>
        {editData && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 80 }}
            className="fixed top-0 right-0 min-h-full bg-white z-50 p-6 overflow-auto shadow-lg rounded-l-2xl w-full sm:w-[400px] bg-gradient-to-br from-purple-50 via-white to-pink-50"
          >
            <InlineUserEditForm
              initialData={editData}
              onCancel={() => setEditData(null)}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}