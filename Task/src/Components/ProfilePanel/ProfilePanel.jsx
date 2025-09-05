import React from "react";
import {
  IconUser,
  IconLock,
  IconLogout,
  IconX,
  IconMail,
  IconBriefcase
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const ProfilePanel = ({ onClose }) => {
  const navigate = useNavigate();

  // Get user data from sessionStorage

  const userData = JSON.parse(sessionStorage.getItem("userData")) || [];
 const user = {
  id: userData.userId || "",
  name: userData.username || "",
  role:sessionStorage.getItem("role")
};


  const handleLogout = () => {
    sessionStorage.clear();
    window.location.href = "/login";
  };

  const handleProfileSettings = () => {
    navigate("/ProfileSettingsPage");
  };

  return (
    <div className="relative p-4 w-full">
      <h2 className="text-lg font-bold text-purple-700 mb-4">Your Account</h2>

      {/* User Info */}
      <div className="bg-purple-50 rounded-lg p-4 mb-4 text-sm text-gray-800">
        <p className="flex items-center gap-2">
          <IconUser size={16} className="text-purple-600" />
          <span className="font-medium">{user.name || "Unknown User"}</span>
        </p>
        <p className="flex items-center gap-2 mt-2">
          <IconBriefcase size={16} className="text-purple-600" />
          <span>{user.role || "No Role"}</span>
        </p>
      </div>

      <ul className="space-y-4 text-sm">
        <li
          className="flex items-center gap-3 cursor-pointer text-purple-700 hover:text-purple-900"
          onClick={handleProfileSettings}
        >
          <IconUser size={18} /> Profile Settings
        </li>

        <li
          className="flex items-center gap-3 cursor-pointer text-red-500 hover:text-red-700 mt-6"
          onClick={handleLogout}
        >
          <IconLogout size={18} /> Logout
        </li>
      </ul>

      <button
        className="absolute top-3 right-3 text-purple-500 hover:text-purple-800"
        onClick={onClose}
      >
        <IconX size={20} />
      </button>
    </div>
  );
};

export default ProfilePanel;
