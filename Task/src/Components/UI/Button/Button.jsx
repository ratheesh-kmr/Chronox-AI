// src/components/ui/button.jsx
import React from "react";

export const Button = ({ children, onClick, variant = "default", ...rest }) => {
  const base = "px-4 py-2 rounded text-sm font-medium transition";
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-100",
  };

  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant]}`}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
