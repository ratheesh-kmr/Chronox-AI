import React from "react";
import { motion } from "framer-motion";

const Loader = ({ message = "Loading..." }) => {
  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "linear",
      },
    },
  };

  const dotVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: "easeInOut",
        times: [0, 0.5, 1],
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="relative flex items-center justify-center w-24 h-24">
        <motion.div
          className="absolute w-16 h-16 border-6 border-t-transparent border-purple-600 rounded-full"
          variants={spinnerVariants}
          animate="animate"
        />
     
      </div>
      <p className="mt-6 text-gray-700 text-lg font-medium">{message}</p>
    </div>
  );
};

export default Loader;