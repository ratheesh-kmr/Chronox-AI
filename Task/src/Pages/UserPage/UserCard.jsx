import React, { useState } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export default function UserCard({
  user,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
}) {
  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();



  return (
    <div className="w-full relative">
      {/* Top-left icons (only when collapsed) */}
      {!isOpen && (
        <div className="absolute top-4 right-2 z-10 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(user);
            }}
            className="text-purple-600 hover:text-purple-800"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(user._id);
            }}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <div className="rounded-xl shadow-lg p-4 bg-white text-gray-800 transition-all hover:shadow-xl flex flex-col gap-2 w-full">
        {/* Header Section with toggle */}
        <div
          className="flex items-center justify-between gap-1.5 cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center font-bold text-white ">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col  min-w-0">
              <span className="font-semibold text-sm break-words whitespace-normal ">{user.name}</span>
              <span className="text-xs text-amber-700">{user.role}</span>
            </div>

          </div>
          <div className="text-gray-600 mt-8">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>

        {/* Collapsible Details Section */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 border-t border-gray-200 pt-3 text-sm">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <p><strong>Team:</strong> {user.teamName || "N/A"}</p>
                  <p><strong>Mobile:</strong> {user.mobileNo || "N/A"}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <span
                      className="truncate"
                      title={user.email}
                    >
                      {user.email}
                    </span>
                  </p>
                  {/* <p><strong>ID:</strong> {user._id}</p> */}
                </div>

                {/* Full buttons inside expanded */}
                <div className="flex gap-3 mt-4 ">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(user);
                    }}
                    className="bg-purple-600 text-white px-3 py-1 text-sm rounded hover:bg-purple-700 flex items-center gap-1"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(user._id);
                    }}
                    className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
