import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Trash,
  Crown,
  UserX,
  Save,
  Users,
  Info,
  AlignLeft,
  Text,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  updateTeam,
  changeTeamLead,
  removeMemberFromTeam,
  deleteTeam,
} from "../../Services/services";

export default function TeamSettingsModal({ team, onClose, onUpdate }) {
  const modalRef = useRef(null);
  const [form, setForm] = useState({ teamName: "", teamDescription: "" });
  const [members, setMembers] = useState([]);
  const [teamLead, setTeamLead] = useState("");
  const [saving, setSaving] = useState(false);

  // Handle click outside modal to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Generate consistent color for avatars
  const getColorForMember = (memberId) => {
    let hash = 0;
    for (let i = 0; i < memberId.length; i++) {
      hash = memberId.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };



  useEffect(() => {
    if (team) {
      setForm({
        teamName: team.teamName || "",
        teamDescription: team.teamDescription || "",
      });
      setMembers(team.members || []);
      setTeamLead(team.teamLeader?._id || "");
    }
  }, [team]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

 const handleLeadChange = async (e) => {
  const newLeadId = e.target.value;
  if (newLeadId === teamLead) return;

  // TEMP FIX: Skip role checking
  try {
    await changeTeamLead(team._id, newLeadId);
    setTeamLead(newLeadId);
    Swal.fire("Updated", "Team lead changed successfully!", "success");
  } catch {
    Swal.fire("Error", "Failed to change team lead.", "error");
  }
};


  const handleRemoveMember = async (memberId) => {
    if (memberId === teamLead) {
      Swal.fire("Cannot Remove", "Change team lead before removing.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Remove Member?",
      text: "They will be unassigned from the team.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove",
      cancelButtonText: "No, keep",
    });

    if (!confirm.isConfirmed) return;

    try {
      await removeMemberFromTeam(team._id, memberId);
      setMembers((prev) => prev.filter((m) => m._id !== memberId));
      Swal.fire("Removed", "Member removed successfully.", "success");
    } catch {
      Swal.fire("Error", "Failed to remove member.", "error");
    }
  };

  const handleDeleteTeam = async () => {
    const confirm = await Swal.fire({
      title: "Delete Team?",
      text: "This will soft delete the team and unassign all members.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "No, cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      await deleteTeam(team._id);
      Swal.fire("Deleted", "Team deleted successfully!", "success");
      onClose();
      onUpdate();
    } catch {
      Swal.fire("Error", "Failed to delete team.", "error");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTeam(team._id, {
        teamName: form.teamName.trim(),
        teamDescription: form.teamDescription.trim(),
      });
      Swal.fire("Saved", "Team updated successfully!", "success");
      onClose();
      onUpdate();
    } catch {
      Swal.fire("Error", "Failed to update team.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!team) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center px-4 py-6">
      <div
        ref={modalRef}
        className="bg-white rounded-xl w-full max-w-2xl p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={24} />
        </button>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold mb-5 text-gray-800 border-b pb-3 flex items-center gap-2">
          <Info size={22} className="text-purple-600" /> Team Settings
        </h2>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Editable Fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                <AlignLeft size={14} className="inline mr-1" /> Team Name
              </label>
              <input
                type="text"
                name="teamName"
                value={form.teamName}
                onChange={handleInputChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                <Text size={14} className="inline mr-1" /> Description
              </label>
              <textarea
                name="teamDescription"
                value={form.teamDescription}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                <Crown size={16} className="text-yellow-500 inline mr-1" /> Team Lead
              </label>
              <div className="relative">
                <select
  value={teamLead || ""}
  onChange={handleLeadChange}
  className="w-full appearance-none bg-white border border-gray-300 px-4 py-2 pr-10 rounded-md shadow-sm text-m text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
>
  {/* Only show this placeholder if there's no team lead selected */}
  {!teamLead && (
    <option value="" disabled>
      Select a Team Lead
    </option>
  )}

  {members.length ? (
    members.map((m) => (
      <option key={m._id} value={m._id}>
        {m.name} {m.role ? `(${m.role})` : ""}
      </option>
    ))
  ) : (
    <option value="" disabled>
      No members to select
    </option>
  )}
</select>


                {/* Custom arrow icon */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                  </svg>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Members List */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              <Users size={16} className="text-blue-500 inline mr-1" /> Team Members
            </label>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {members.length ? (
                members.map((m) => (
                  <div
                    key={m._id}
                    className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full text-white text-sm font-semibold flex items-center justify-center"
                        style={{ backgroundColor: getColorForMember(m._id) }}
                      >
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-800 font-medium truncate">
                        {m.name}
                        {m._id === teamLead && (
                          <span className="ml-2 text-yellow-600 text-xs font-semibold">
                            (Lead)
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m._id)}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      disabled={m._id === teamLead}
                      title="Remove"
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm italic text-gray-500 text-center py-3">
                  No members assigned.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={handleDeleteTeam}
            className="w-full sm:w-auto text-red-600 hover:text-red-800 px-6 py-2 rounded-md hover:bg-red-50 transition flex items-center justify-center gap-2"
          >
            <Trash size={18} /> Delete Team
          </button>
        </div>
      </div>
    </div>
  );
}
