import React, { useState } from "react";
import { X, Check } from "lucide-react";

export default function AddMembersModal({ users = [], onClose, onAssign }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    onAssign(selectedIds);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Add Members to Team
        </h2>

        {users.length === 0 ? (
          <p className="text-sm text-gray-500">No unassigned users found.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scroll-smooth">
              {users.map((user) => {
                const isSelected = selectedIds.includes(user._id);
                return (
                  <label
                    key={user._id}
                    className={`flex items-center gap-3 px-2 py-1 rounded-md cursor-pointer transition ${
                      isSelected ? "bg-purple-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={user._id}
                      checked={isSelected}
                      onChange={() => toggleUser(user._id)}
                      className="form-checkbox text-purple-600 rounded focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-800">{user.name}</span>
                      <div className="text-xs text-gray-500">
                        {user.email || "No email"}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={16} className="text-green-500" />
                    )}
                  </label>
                );
              })}
            </div>

            <button
              type="submit"
              className={`w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition text-sm font-medium ${
                selectedIds.length === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={selectedIds.length === 0}
            >
              Add Selected Members
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
