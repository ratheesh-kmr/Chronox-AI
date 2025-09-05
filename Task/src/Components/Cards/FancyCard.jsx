import React from "react";
import { Pencil, Trash2 } from "lucide-react";

export default function FancyCard({ user, onEdit, onDelete }) {
  const { name, email, mobileNo, role, status } = user;

  return (
    <div className="w-[290px] h-[300px] perspective-[1000px] group relative">
      <div className="w-full h-full rounded-[50px] bg-gradient-to-br from-[#00ffd6] to-[#08e260] transition-all duration-500 ease-in-out transform-style-3d shadow-[rgba(5,71,17,0)_40px_50px_25px_-40px,rgba(5,71,17,0.2)_0px_25px_25px_-5px] group-hover:rotate-[30deg] group-hover:shadow-[rgba(5,71,17,0.3)_30px_50px_25px_-40px,rgba(5,71,17,0.1)_0px_25px_30px_0px] relative overflow-hidden">

        <div className="absolute inset-[8px] rounded-[55px] rounded-tr-[100%] bg-gradient-to-b from-white/40 to-white/80 backdrop-blur-[5px] border-l border-b border-white translate-z-[25px]"></div>

        <div className="p-[80px_30px_0px_30px] translate-z-[26px] relative">
          <p className="block text-[#00894d] font-black text-[18px] leading-tight">{name}</p>
          <p className="text-[13px] text-[#00894d]/80">{email}</p>
          <div className="mt-4 text-sm text-[#00894d]/90 space-y-1">
            <p><strong>Mobile:</strong> {mobileNo || "N/A"}</p>
            <p><strong>Role:</strong> {role}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`font-semibold ${status === 1 ? "text-green-600" : "text-red-600"}`}>
                {status === 1 ? "Active" : "Inactive"}
              </span>
            </p>
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5 flex justify-between items-center px-3 translate-z-[26px]">
          <button
            onClick={() => onEdit(user)}
            className="w-[32px] h-[32px] bg-white rounded-full grid place-content-center shadow-md hover:bg-purple-600 hover:text-white transition"
            title="Edit"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(user._id)}
            className="w-[32px] h-[32px] bg-white rounded-full grid place-content-center shadow-md hover:bg-red-600 hover:text-white transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
