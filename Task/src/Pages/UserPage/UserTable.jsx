import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function UserTable({ users, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden ">
        <thead className="bg-purple-600 text-white text-sm">
          <tr>
            <th className="py-2 px-4 text-left">#</th>
            <th className="py-2 px-4 text-left">Name</th>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Mobile</th>
            <th className="py-2 px-4 text-left">Team</th>
            <th className="py-2 px-4 text-left">Role</th>
            <th className="py-2 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">
          {users.map((user, index) => (
            <tr key={user._id} className="border-b hover:bg-purple-50 even:bg-gray-50 transition-all">
              <td className="py-2 px-4 font-medium">{index + 1}</td>
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.mobileNo || "N/A"}</td>
           <td className="py-2 px-4">{user.teamName || "No Team"}</td>
              <td className="py-2 px-4 capitalize">{user.role}</td>
              <td className="py-2 px-4 text-center">
                <button
                  onClick={() => onEdit(user)}
                  className="text-purple-700 hover:text-purple-900 mr-2"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onDelete(user._id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
