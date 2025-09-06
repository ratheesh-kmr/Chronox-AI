import React, { useEffect, useState } from "react";
import {
  IconDashboard,
  IconUsers,
  IconUsersGroup,
  IconFolder,
  IconFileAi,
  IconBeach,
  IconHeartRateMonitor,
  IconLayoutSidebarLeftCollapse,
  IconRouteSquare,
  IconUser,
  IconHelp,
  IconMailQuestion,
  IconMail,
  IconCalendarClock,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { fetchNotifications } from "../../Services/notificationService"; // Adjust path as needed

// Global navigation definitions
const navMain = [
  { label: "Dashboard", icon: <IconDashboard />, to: "/dashboard", key: "dashboard" },
  { label: "Dashboard", icon: <IconDashboard />, to: "/EmployeeDashboard", key: "EmployeeDashboard" },
  { label: "Dashboard", icon: <IconDashboard />, to: "/TeamLeadDashboard", key: "TeamLeadDashboard" },
  { label: "Users", icon: <IconUsers />, to: "/users", key: "users" },
  { label: "Teams", icon: <IconUsersGroup />, to: "/teams", key: "teams" },
  { label: "Team", icon: <IconUsersGroup />, to: "/TeamLeadPage", key: "TeamLeadPage" },
  { label: "Projects", icon: <IconFolder />, to: "/ProjectPage", key: "projects" },
  { label: "Projects", icon: <IconFolder />, to: "/EmployeeProjectsPage", key: "EmployeeProjectsPage" },
  { label: "Projects", icon: <IconFolder />, to: "/TeamLeadProjectsPage", key: "TeamLeadProjectsPage" },
  { label: "Tasks", icon: <IconFileAi />, to: "/TasksPage", key: "AdminTasks" },
  { label: "Tasks", icon: <IconFileAi />, to: "/EmployeeTaskPage", key: "EmployeeTask" },
  { label: "Tasks", icon: <IconFileAi />, to: "/TeamLeadTaskPage", key: "TeamLeadTask" },
  { label: "Holidays", icon: <IconBeach />, to: "/HolidaysPage", key: "holidays" },
  { label: "Activity Log", icon: <IconHeartRateMonitor />, to: "/activity-log", key: "activity-log" },
  
];

const Utilities = [
  { label: "Milestones", icon: <IconRouteSquare />, to: "/MilestoneHandlerPage", key: "milestones" },
  { label: "Extension Requests Page", icon: <IconMailQuestion />, to: "/ExtensionRequestsPage", key: "ExtensionRequestsPage" },
  { label: "Extension Requests Page", icon: <IconMailQuestion />, to: "/TeamLeadExtensionRequestsPage", key: "TeamLeadExtensionRequestsPage" },
  { label: "Mail", icon: <IconMail />, to: "/Mail", key: "Mail" },
  { label: "Meetings", icon: <IconCalendarClock />, to: "/MeetingsPage", key: "Meetings" },

];

const navSecondary = [
  { label: "Profile Settings", icon: <IconUser />, to: "/ProfileSettingsPage", key: "profile" },
  { label: "Get Help", icon: <IconHelp />, to: "/GetHelpPage", key: "help" },
];

// Role-based menu access
const roleMenus = {
  SUPER_ADMIN: { navMain: ["dashboard", "users", "teams", "projects", "AdminTasks", "holidays", "activity-log"], Utilities: ["reports", "milestones", "ExtensionRequestsPage", "Mail","Meetings"], navSecondary: ["profile", "help"] },
  ADMIN: { navMain: ["dashboard", "users", "teams", "projects", "AdminTasks", "holidays", "activity-log"], Utilities: ["reports", "milestones", "ExtensionRequestsPage", "Mail","Meetings"], navSecondary: ["profile", "help"] },
  PROJECT_LEAD: { navMain: ["dashboard", "teams", "projects", "AdminTasks", "holidays"], Utilities: ["milestones"], navSecondary: ["profile", "help", "ExtensionRequestsPage", "Mail","Meetings"] },
  TEAM_LEAD: { navMain: ["TeamLeadDashboard", "TeamLeadPage","TeamLeadProjectsPage", "TeamLeadTask", "holidays"], Utilities: ["Mail" , "TeamLeadExtensionRequestsPage","Meetings"], navSecondary: ["profile", "help"] },
  EMPLOYEE: { navMain: ["EmployeeDashboard", "EmployeeTask", "EmployeeProjectsPage", "holidays"], Utilities: ["Mail"], navSecondary: ["profile", "help"] },
};

const SideBar = ({ collapsed, onToggle }) => {
  const roleKey = (sessionStorage.getItem("role") || "").toUpperCase();
  const allowed = roleMenus[roleKey] || { navMain: [], Utilities: [], navSecondary: [] };

  const visibleMainNav = navMain.filter((item) => allowed.navMain.includes(item.key));
  const visibleUtilities = Utilities.filter((item) => allowed.Utilities.includes(item.key));
  const visibleSecondary = navSecondary.filter((item) => allowed.navSecondary.includes(item.key));

  const [notificationCounts, setNotificationCounts] = useState({
    TASK: 0,
    PROJECT: 0,
    TEAM: 0
  });
  const [socket, setSocket] = useState(null);

  // Initialize socket connection and fetch initial notifications
  useEffect(() => {
    const token = sessionStorage.getItem("token"); // Adjust based on your token storage method
    
    // Initialize socket connection
    const socketInstance = io("http://localhost:5000/", {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(socketInstance);

    // Fetch initial unread notifications count by type
    const fetchInitialNotificationCounts = async () => {
      try {
        const res = await fetchNotifications();
        const notifications = res.data.notifications;
        
        const counts = {
          TASK: notifications.filter(n => !n.read && n.type === "TASK").length,
          PROJECT: notifications.filter(n => !n.read && n.type === "PROJECT").length,
          TEAM: notifications.filter(n => !n.read && n.type === "TEAM").length
        };
        
        setNotificationCounts(counts);
      } catch (error) {
        console.error("Failed to fetch initial notifications:", error);
      }
    };

    fetchInitialNotificationCounts();

    // Listen for new notifications
    socketInstance.on("new_notification", (notification) => {
      if (["TASK", "PROJECT", "TEAM"].includes(notification.type)) {
        setNotificationCounts((prev) => ({
          ...prev,
          [notification.type]: prev[notification.type] + 1
        }));
      }
    });

    // Cleanup on unmount
    return () => {
      socketInstance.off("new_notification");
      socketInstance.disconnect();
    };
  }, []);

  // Function to handle navigation click and reset badge
  const handleNavigation = (to, type) => {
    // Reset notification count when user clicks on relevant navigation
    if (type && notificationCounts[type] > 0) {
      setNotificationCounts(prev => ({
        ...prev,
        [type]: 0
      }));
    }
  };

  // Listen for notifications being marked as read from the notification panel
  useEffect(() => {
    const handleNotificationRead = (event) => {
      if (event.detail && ["TASK", "PROJECT", "TEAM"].includes(event.detail.type)) {
        setNotificationCounts((prev) => ({
          ...prev,
          [event.detail.type]: Math.max(prev[event.detail.type] - 1, 0)
        }));
      }
    };

    const handleAllNotificationsRead = () => {
      setNotificationCounts({
        TASK: 0,
        PROJECT: 0,
        TEAM: 0
      });
    };

    // Listen for custom events from notification panel
    window.addEventListener("notificationRead", handleNotificationRead);
    window.addEventListener("allNotificationsRead", handleAllNotificationsRead);

    return () => {
      window.removeEventListener("notificationRead", handleNotificationRead);
      window.removeEventListener("allNotificationsRead", handleAllNotificationsRead);
    };
  }, []);

  return (
    <div
      className={`h-screen z-50 bg-purple-50 text-purple-950 flex flex-col 
          fixed md:static transition-all duration-300 ease-in-out
          ${collapsed ? "w-0 min-w-0 opacity-75 pointer-events-none" : "w-[260px] md:w-[280px] opacity-100"}
          overflow-y-auto scroll-smooth scrollbar-none`}
    >
      {/* Collapse Button */}
      <div className="md:hidden flex justify-end p-2">
        <button onClick={onToggle} className="text-purple-950 text-lg px-3 py-1 rounded flex items-center">
          <IconLayoutSidebarLeftCollapse size={20} />
        </button>
      </div>

      {/* Logo */}
      <div className="flex items-center justify-start p-4">
        <a href="/" className="flex items-center gap-2">
          <img src="/PNG.png" alt="Logo" className="w-12 h-10" />
          <span className="text-xl font-semibold md:inline-block whitespace-nowrap">ChronoX</span>
        </a>
      </div>

      <div className="flex flex-col justify-between h-full p-4 space-y-6">
        {/* Main Navigation */}
        <NavSection 
          title="Main" 
          items={visibleMainNav} 
          notificationCounts={notificationCounts} 
          onNavigation={handleNavigation}
          onToggle={onToggle} 
        />

        {/* Utilities */}
        {visibleUtilities.length > 0 && <NavSection title="Utilities" items={visibleUtilities} onToggle={onToggle} />}

        {/* More */}
        {visibleSecondary.length > 0 && <NavSection title="More" items={visibleSecondary} onToggle={onToggle} />}
      </div>
    </div>
  );
};

const NavSection = ({ title, items, notificationCounts, onNavigation, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Function to determine notification type based on item key
  const getNotificationType = (itemKey) => {
    const key = itemKey.toLowerCase();
    if (key.includes("task")) return "TASK";
    if (key.includes("project")) return "PROJECT";
    if (key.includes("team")) return "TEAM";
    return null;
  };

  const handleNavigationClick = (to, itemKey) => {
    const notificationType = getNotificationType(itemKey);
    
    // Check if this navigation has notifications and reset them
    if (notificationType && onNavigation) {
      onNavigation(to, notificationType);
    }

    navigate(to);

    // Check if the screen is mobile (less than the 'md' breakpoint)
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  return (
    <div>
      <h2 className="text-xs font-semibold text-purple-950 uppercase mb-2 px-2">{title}</h2>
      <ul className="space-y-1">
        {items.map((item, idx) => {
          const isActive = location.pathname === item.to;
          const notificationType = getNotificationType(item.key);
          const notificationCount = notificationType ? notificationCounts?.[notificationType] || 0 : 0;
          const showBadge = notificationCount > 0;

          return (
            <li key={idx}>
              <button
                onClick={() => item.to && handleNavigationClick(item.to, item.key)}
                className={`flex items-center justify-between w-full text-left px-4 py-2 text-sm rounded-md transition-all duration-200
                  ${isActive ? "bg-purple-500 text-white" : "hover:bg-purple-100 text-purple-950"}`}
              >
                <div className="flex items-center">
                  <span className="mr-3 w-5 h-5">{item.icon}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>

                {showBadge && (
                  <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SideBar;