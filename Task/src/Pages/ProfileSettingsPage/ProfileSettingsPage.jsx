import React, { useEffect, useState } from "react";
import { IconLock, IconMail, IconPhone, IconUser } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import ChangePasswordForm from "../../Components/Forms/ChangePasswordForm";
import ChangeEmailForm from "../../Components/Forms/ChangeEmailForm";
import ChangeMobileForm from "../../Components/Forms/ChangeMobileForm";
import { fetchLoggedInUser } from "../../Services/services";
import { toast } from "react-toastify";

const ProfileSettingsPage = () => {
  const [activePanel, setActivePanel] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await fetchLoggedInUser();
        setUser(userData);
      } catch (error) {
        toast.error("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  const togglePanel = (panel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

const renderForm = (panel) => {
  switch (panel) {
    case "password":
      return <ChangePasswordForm onClose={() => setActivePanel(null)} />;
    case "email":
      return <ChangeEmailForm user={user} onClose={() => setActivePanel(null)} />;
    case "mobile":
      return <ChangeMobileForm user={user} onClose={() => setActivePanel(null)} />;
    default:
      return null;
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-purple-600">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="h-relative w-full bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 p-6 rounded-xl min-h-screen">
      <div className="w-full max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-purple-800 mb-6">
          Profile Settings
        </h1>

        {/* User Details Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-white rounded-xl shadow-lg border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8"
          >
            <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 shadow-inner">
              <IconUser size={32} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">
                {user.name}
              </h2>
              <p className="text-sm text-gray-500">{user.role}</p>
              <div className="mt-2 text-sm space-y-1">
                <p className="flex items-center gap-2 text-gray-600">
                  <IconMail size={16} />
                  <span>{user.email}</span>
                </p>
                {user.mobileNo && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <IconPhone size={16} />
                    <span>{user.mobileNo}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Options */}
        <div className="space-y-4">
          {/* Password */}
          <div>
            <div
              onClick={() => togglePanel("password")}
              className="p-4 bg-white rounded-xl shadow hover:bg-purple-50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
            >
              <IconLock size={20} className="text-purple-700" />
              <span className="font-medium text-gray-700">Change Password</span>
            </div>
            <AnimatePresence>
              {activePanel === "password" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden p-4 border-t border-purple-100 rounded-b-xl"
                >
                  {renderForm("password")}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div>
            <div
              onClick={() => togglePanel("email")}
              className="p-4 bg-white rounded-xl shadow hover:bg-purple-50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
            >
              <IconMail size={20} className="text-purple-700" />
              <span className="font-medium text-gray-700">Change Email</span>
            </div>
            <AnimatePresence>
              {activePanel === "email" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden p-4 border-t border-purple-100 rounded-b-xl"
                >
                  {renderForm("email")}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile */}
          {/* <div>
            <div
              onClick={() => togglePanel("mobile")}
              className="p-4 bg-white rounded-xl shadow hover:bg-purple-50 cursor-pointer flex items-center gap-3 transition-colors duration-200"
            >
              <IconPhone size={20} className="text-purple-700" />
              <span className="font-medium text-gray-700">
                Change Mobile Number
              </span>
            </div>
            <AnimatePresence>
              {activePanel === "mobile" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden p-4 border-t border-purple-100 rounded-b-xl"
                >
                  {renderForm("mobile")}
                </motion.div>
              )}
            </AnimatePresence>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;