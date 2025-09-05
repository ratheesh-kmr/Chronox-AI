import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function TeamFormModal({ visible, onClose, onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    teamName: "",
    teamDescription: "",
  });

  const [lead, setLead] = useState({ name: "", id: "" });
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const initForm = async () => {
      const stored = JSON.parse(sessionStorage.getItem("userData"));
      const name = stored?.name || "";
      const id = stored?._id || "";

      setLead({ name, id });

      if (initialData && visible) {
        setForm({
          teamName: initialData.teamName || "",
          teamDescription: initialData.teamDescription || "",
        });
      } else {
        setForm({ teamName: "", teamDescription: "" });
      }
    };

    if (visible) {
      initForm();
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [visible, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getRandomColor = () => {
    const colors = ["#8F87F1", "#C68EFD", "#E9A5F1", "#FED2E2", "#F97316", "#60A5FA"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.teamName.trim()) return;

    const teamData = {
      teamName: form.teamName.trim(),
      teamDescription: form.teamDescription.trim(),
      teamLeader: lead.id, // Must be a valid ObjectId (handled by backend)
      leadName: lead.name,
      color: initialData?._id ? initialData.color : getRandomColor(),
    };

    onSubmit(teamData);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div
        className={`bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative transform transition-all duration-300 ${
          animate ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {initialData?._id ? "Edit Team" : "Create New Team"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              name="teamName"
              value={form.teamName}
              onChange={handleChange}
              placeholder="e.g. Product Engineers"
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="teamDescription"
              value={form.teamDescription}
              onChange={handleChange}
              placeholder="Describe the team's purpose"
              rows={3}
              className="w-full border border-gray-300 px-3 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium"
          >
            {initialData?._id ? "Update Team" : "Create Team"}
          </button>
        </form>
      </div>
    </div>
  );
}
