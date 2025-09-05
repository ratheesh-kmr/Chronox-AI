import { useState, useRef, useEffect, lazy, Suspense } from "react";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconUserCircle,
  IconMessageCircle,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import SideBar from "../Components/SideBar/SideBar";
import ProfilePanel from "../Components/ProfilePanel/ProfilePanel";
import Notifications from "../Components/Notification/Notification";

const AssistantPanel = lazy(() => import("../Components/Assistant/AssistantPanel"));

const userId = sessionStorage.getItem("userId");
const token = sessionStorage.getItem("token");

const SidebarLoader = () => (
  <div className="w-[260px] h-screen bg-purple-50 animate-pulse" />
);

const ProfileLoader = () => (
  <div className="bg-white border border-purple-100 rounded-2xl shadow-lg w-64 h-32 animate-pulse" />
);

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const profileRef = useRef(null);
  const iconRef = useRef(null);
  const assistantRef = useRef(null);

  const userRole = sessionStorage.getItem("role");
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  const toggleSidebar = () => setCollapsed((prev) => !prev);
  const toggleProfile = () => setProfileOpen((prev) => !prev);
  const toggleAssistant = () => setAssistantOpen((prev) => !prev);

  // ... (profile & assistant outside click handlers stay the same)
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileOpen]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        assistantOpen &&
        assistantRef.current &&
        !assistantRef.current.contains(event.target)
      ) {
        setAssistantOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [assistantOpen]);


  return (
    <div className="flex h-screen w-full overflow-hidden relative">
      {/* Sidebar */}
      <Suspense fallback={<SidebarLoader />}>
        <SideBar collapsed={collapsed} onToggle={toggleSidebar} />
      </Suspense>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-purple-50 p-4 relative">
        {/* Top bar */}
        <div className="flex justify-between items-center relative">
          <button
            className="mb-4 p-2 text-purple-950 rounded"
            onClick={toggleSidebar}
          >
            {collapsed ? (
              <IconLayoutSidebarLeftExpand size={20} />
            ) : (
              <IconLayoutSidebarLeftCollapse size={20} />
            )}
          </button>
          <div className="flex p-3 items-center gap-2">
            <Notifications userId={userId} token={token} />
            <div
              ref={iconRef}
              className="cursor-pointer text-purple-950"
              onClick={toggleProfile}
            >
              <IconUserCircle size={28} />
            </div>
          </div>

          {/* Profile dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                ref={profileRef}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="absolute top-12 right-0 bg-white border border-purple-100 rounded-2xl shadow-lg w-64 max-w-[90vw] z-49"
              >
                <Suspense fallback={<ProfileLoader />}>
                  <ProfilePanel onClose={toggleProfile} />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main children */}
        {children}

        {/* 👇 Show only for ADMIN & SUPER_ADMIN */}
        {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
          <>
            {/* Floating Assistant Button */}
            <button
              onClick={toggleAssistant}
              className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition z-50"
            >
              <IconMessageCircle size={24} />
            </button>

            {/* Assistant Panel Slide-in */}
            <AnimatePresence>
              {assistantOpen && (
                <motion.div
                  ref={assistantRef}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="fixed bottom-20 right-6 z-50 overflow-hidden 
 bg-white border border-purple-200 shadow-2xl rounded-2xl
w-11/12 max-w-sm
 sm:w-[300px] sm:max-w-none
md:w-[400px]
lg:w-[450px]"
                >
                  <Suspense fallback={<div className="p-4">Loading Assistant...</div>}>
                    <AssistantPanel onClose={toggleAssistant} />
                  </Suspense>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};


export default AppLayout;