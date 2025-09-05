import React from "react";
import { cn } from "@/lib/utils"; 

export default function WidgetCard({ title, children, className = "" }) {
  return (
    <div
      className={cn(
        "bg-white shadow-md rounded-2xl p-4 flex flex-col justify-between",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
}
