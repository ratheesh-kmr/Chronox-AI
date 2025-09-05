import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Play,
  StopCircle,
  Plus,
  User,
  Target,
  TrendingUp,
  AlertTriangle,
  FileText,
  ChevronRight,
  Timer,
  Award,
  Filter,
  Users, // Icon for greeting
  Rocket, // Icon for projects
  Pin, // Icon for tasks
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  fetchTasksByUser,
  fetchProjectsByUser,
  fetchLoggedInUser,
} from "../../Services/EmployeeServices";

const COLORS = {
  primary: "#8F87F1",
  secondary: "#C68EFD",
  tertiary: "#E9A5F1",
  light: "#FED2E2",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
};

const EmployeeDashboard = () => {
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, overdue: 0, upcoming: 0, inProgress: 0 });
  const [allTasks, setAllTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [userProjects, setUserProjects] = useState([]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchLoggedInUser();
        setUserId(user.id);
        setUserName(user.name);
        setUserRole(user.role); // assuming backend sends role
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };
    loadUser();
  }, []);

  // Fetch all data
  useEffect(() => {
    if (!userId) return;

    const fetchAllData = async () => {
      try {
        const [tasks, projects] = await Promise.all([
          fetchTasksByUser(userId),
          fetchProjectsByUser(userId),
        ]);

        setAllTasks(tasks);
        setFilteredTasks(tasks);
        setUserProjects(projects);

        // Calculate stats
        let completed = 0, overdue = 0, upcoming = 0, inProgress = 0;
        const today = new Date().toISOString().split("T")[0];

        tasks.forEach(task => {
          switch (task.status) {
            case "Completed": completed++; break;
            case "Overdue": overdue++; break;
            case "InProgress": inProgress++; break;
            default:
              if (new Date(task.taskStartDate).toISOString().split("T")[0] > today) {
                upcoming++;
              }
          }
        });

        setTaskStats({
          total: tasks.length,
          completed,
          overdue,
          upcoming,
          inProgress
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchAllData();
  }, [userId]);

  const filterTasks = (filter) => {
    setActiveFilter(filter);
    if (filter === "All") {
      setFilteredTasks(allTasks);
    } else {
      const filtered = allTasks.filter(task => {
        if (filter === "Upcoming") {
          const today = new Date().toISOString().split("T")[0];
          return task.status === "ToDo" && new Date(task.taskStartDate).toISOString().split("T")[0] > today;
        }
        return task.status === filter || (filter === "ToDo" && task.status === "ToDo");
      });
      setFilteredTasks(filtered);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getDaysUntilDeadline = (endDate) => {
    const today = new Date();
    const deadline = new Date(endDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgentTasks = () => {
    return allTasks.filter(task => {
      const daysLeft = getDaysUntilDeadline(task.taskEndDate);
      return (task.status === "ToDo" || task.status === "In Progress") && daysLeft <= 3 && daysLeft >= 0;
    });
  };

  const getProgressPercentage = () => {
    if (taskStats.total === 0) return 0;
    return Math.round((taskStats.completed / taskStats.total) * 100);
  };

  return (
    <main className="p-6 w-full bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-xl min-h-screen">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-900 mb-2">
                {getGreeting()}, {userName} <Users className="inline-block w-8 h-8 text-purple-600" />
              </h1>
              <p className="text-purple-700 font-medium">{userRole}</p>
              <p className="text-sm text-gray-600 mt-2">
                You have {taskStats.inProgress + taskStats.total - taskStats.completed - taskStats.overdue} tasks pending. Let's make today productive! <TrendingUp className="inline-block w-4 h-4 text-purple-600" />
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">{currentTime.toLocaleDateString()}</div>
              <div className="text-lg font-semibold text-purple-800">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>
      </div>

      {isReady ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Stats Cards */}
          <div className="xl:col-span-12">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <StatCard
                icon={<FileText size={20} />}
                title="Total Tasks"
                value={taskStats.total}
                color={COLORS.primary}
                subtitle="All assigned"
              />
              <StatCard
                icon={<CheckCircle size={20} />}
                title="Completed"
                value={taskStats.completed}
                color={COLORS.success}
                subtitle={`${getProgressPercentage()}% done`}
              />
              <StatCard
                icon={<Play size={20} />}
                title="In Progress"
                value={taskStats.inProgress}
                color={COLORS.secondary}
                subtitle="Active now"
              />
              <StatCard
                icon={<AlertTriangle size={20} />}
                title="Overdue"
                value={taskStats.overdue}
                color={COLORS.danger}
                subtitle="Need attention"
              />
              <StatCard
                icon={<Calendar size={20} />}
                title="Upcoming"
                value={taskStats.upcoming}
                color={COLORS.tertiary}
                subtitle="Scheduled"
              />
            </div>
          </div>

          {/* My Tasks Section */}
          <div className="xl:col-span-8">
            <WidgetCard title={
              <div className="flex items-center gap-2">
                <Pin size={20} className="text-gray-600" /> My Tasks
              </div>
            } className="h-full">
              {/* Task Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["All", "ToDo", "InProgress", "Completed", "OverDue", "Upcoming"].map(filter => (
                  <button
                    key={filter}
                    onClick={() => filterTasks(filter)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${activeFilter === filter
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Tasks List */}
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskCard key={task._id} task={task} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No tasks found for "{activeFilter}" filter</p>
                  </div>
                )}
              </div>
            </WidgetCard>
          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-4 space-y-6">
            {/* Deadlines & Extensions */}
            <WidgetCard title={
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-gray-600" /> Urgent Deadlines
              </div>
            }>
              {getUrgentTasks().length > 0 ? (
                <div className="space-y-3">
                  {getUrgentTasks().slice(0, 3).map(task => (
                    <div key={task._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-800 truncate">
                          {task.taskList.substring(0, Math.ceil(task.taskList.length / 2))}...
                        </p>
                        <p className="text-xs text-gray-600">{task.projectName}</p>
                      </div>
                      <div className="text-right ml-0">
                        <div className="text-xs font-bold text-red-600">
                          {getDaysUntilDeadline(task.taskEndDate)} days
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(task.taskEndDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Timer size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No urgent deadlines</p>
                </div>
              )}
            </WidgetCard>

            {/* Progress Overview */}
            <WidgetCard title={
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-gray-600" /> Progress Overview
              </div>
            }>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke={COLORS.primary}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${getProgressPercentage() * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-purple-800">{getProgressPercentage()}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Overall Completion</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-bold text-green-600">{taskStats.completed}</div>
                    <div className="text-xs text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-bold text-blue-600">{taskStats.inProgress}</div>
                    <div className="text-xs text-gray-600">In Progress</div>
                  </div>
                </div>
              </div>
            </WidgetCard>
          </div>

          {/* Current Projects */}
          <div className="xl:col-span-6">
            <WidgetCard title={
              <div className="flex items-center gap-2">
                <Rocket size={20} className="text-gray-600" /> Current Projects
              </div>
            } className="h-full">
              {userProjects.length > 0 ? (
                <div className="space-y-4">
                  {userProjects.map((project) => (
                    <div key={project._id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300"
                      onClick={() => navigate(`/EmployeeProjectsPage`)} 
                      >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg text-gray-800 mb-2">{project.projectName}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: project.description || "<i>No description provided.</i>" }} />
                        </div>
                        <div className="ml-4">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Active</span>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No projects assigned</p>
                </div>
              )}
            </WidgetCard>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="rounded-xl bg-purple-100 h-24"></div>
          <div className="rounded-xl bg-purple-100 h-24"></div>
        </div>
      )}
    </main>
  );
};

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <div className="rounded-xl bg-white p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
    <div className="flex items-center gap-3 mb-3">
      <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20', color: color }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
      </div>
    </div>
    <div className="text-sm font-medium text-gray-700">{title}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
  </div>
);

const WidgetCard = ({ title, children, className = "" }) => (
  <div className={`rounded-xl bg-white p-6 shadow-lg border border-gray-100 ${className}`}>
    <h2 className="text-lg font-bold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

const TaskCard = ({ task }) => {
  const navigate = useNavigate();
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return COLORS.success;
      case "In Progress": return COLORS.secondary;
      case "Overdue": return COLORS.danger;
      case "ToDo": return COLORS.primary;
      default: return COLORS.tertiary;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return COLORS.danger;
      case "Medium": return COLORS.warning;
      case "Low": return COLORS.success;
      default: return COLORS.primary;
    }
  };

  const daysLeft = getDaysUntilDeadline(task.taskEndDate);

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 mb-1">{task.taskList}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        </div>
        <div className="flex gap-2 ml-3">
          <span
            className="text-xs px-2 py-1 rounded-full text-white font-medium"
            style={{ backgroundColor: getStatusColor(task.status) }}
          >
            {task.status}
          </span>
          <span
            className="text-xs px-2 py-1 rounded-full text-white font-medium"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-gray-500">
            <Calendar className="inline-block w-4 h-4 mr-1 text-gray-500" /> Due: {new Date(task.taskEndDate).toLocaleDateString()}
          </span>
          {daysLeft >= 0 && (
            <span className={`font-medium ${daysLeft <= 3 ? 'text-red-600' : 'text-gray-600'}`}>
              {daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/TaskDetailsPage/${task._id}`)}
            className="text-purple-600 hover:text-purple-800 font-medium"
          >
            View
          </button>
          {/* {task.status !== "Completed" && (
            <button className="text-green-600 hover:text-green-800 font-medium">
              Complete
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
};

const getDaysUntilDeadline = (endDate) => {
  const today = new Date();
  const deadline = new Date(endDate);
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export default EmployeeDashboard;