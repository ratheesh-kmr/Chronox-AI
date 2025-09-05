import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const token = sessionStorage.getItem("token");

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/",
  headers: {
    authorization: `Bearer ${token}`,
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
import {
  BarChart2,
  Users,
  Plus,
  Play,
  StopCircle,
  CheckCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ClipboardList,
  SquareCheckBig,
  BarChart,
  Calendar,
  RotateCcw,
  UserCheck,
  Clock,
  Award,
  AlertTriangle,
  Download,
  FileText,
  Target,
  Timer,
  Crown,
  UserMinus,
  Zap,
  Eye,
  X,
  ChevronDown,
  Briefcase,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Info,
  BellOff,

} from "lucide-react";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Disclosure } from '@headlessui/react';

const COLORS = {
  primary: "#6A64F1",
  secondary: "#C68EFD",
  tertiary: "#E9A5F1",
  inProgress: "#FFCC00",
  pending: "#FF6347",
  light: "#F0EFFF",
  background: "#F9F6FF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6"
};

const PIE_COLORS = ['#6A64F1', '#C68EFD', '#10B981', '#F59E0B', '#EF4444'];

const getPriorityLineColor = (priority) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-400';
  }
};

const getPriorityBadgeColor = (priority) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-200 text-red-800';
    case 'medium':
      return 'bg-yellow-200 text-yellow-800';
    case 'low':
      return 'bg-green-200 text-green-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};



const enhancedApiService = {
  // Dashboard Summary
  async fetchDashboardSummary() {
    try {
      const response = await axiosInstance.get("api/dashboard/summary");

      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      throw error;
    }
  },

  // Project Analytics
  async fetchProjectAnalytics() {
    try {
      const response = await axiosInstance.get("api/dashboard/analytics");

      return response.data;
    } catch (error) {
      console.error("Error fetching project analytics:", error);
      throw error;
    }
  },

  // recent Tasks
  async getRecentTasks() {
    try {
      const response = await axiosInstance.get("api/dashboard/getRecentTasks");
      return response.data;
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      throw error;
    }
  },

  // Project Progress
  async fetchProjectProgress(projectId) {
    const response = await axiosInstance.get(`/api/dashboard/project-progress/${projectId}`);
    return response.data;
  },

  // Next Meeting
  async fetchNextMeeting() {
    return {
      title: "Sprint Planning",
      date: "2025-08-25",
      time: "10:00 AM",
      attendees: 8
    };
  },

  // Projects
  async fetchProjects() {
    try {
      const response = await axiosInstance.get("api/project");
      return response.data.project;
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },

  // Project Analytics by ID
  async fetchProjectAnalyticsById(selectedProjectId) {
    try {
      const response = await axiosInstance.get(`api/dashboard/project-analytics/${selectedProjectId}`);
      console.log("analytics:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for project ${selectedProjectId}:`, error);
      throw error;
    }
  },


  // People Management APIs
  async fetchTeamSummary() {
    const response = await axiosInstance.get("api/dashboard/TeamSummary");
    return response.data.teams;
  },

  // Insights APIs
  async fetchOverdueTasks() {
    const response = await axiosInstance.get("api/dashboard/overdueTask");
    return response.data.overdueTasks;
  },

  async fetchNotifications() {
  try {
    const response = await axiosInstance.get("/api/notifications");
    return response.data.notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
},

  async fetchTopPerformers() {
    return [
      { id: 1, name: "Mike Johnson", completedTasks: 31, efficiency: 95, avatar: "/api/placeholder/32/32" },
      { id: 2, name: "John Doe", completedTasks: 23, efficiency: 92, avatar: "/api/placeholder/32/32" },
      { id: 3, name: "Alex Chen", completedTasks: 20, efficiency: 90, avatar: "/api/placeholder/32/32" }
    ];
  },

  async fetchRiskAnalysis() {
    return {
      highRiskProjects: 2,
      criticalTasks: 5,
      resourceConstraints: 3,
      risks: [
        { type: "Schedule", level: "High", description: "3 projects behind schedule" },
        { type: "Resource", level: "Medium", description: "Team capacity at 95%" },
        { type: "Quality", level: "Low", description: "Minor issues detected" }
      ]
    };
  },

  // Time Tracking APIs
async fetchTimeTracking() {
  // Generate total hours between 150–180
  const totalHours = (150 + Math.random() * 30).toFixed(1);

  // Billable hours slightly less than total
  const billableHours = (totalHours * (0.75 + Math.random() * 0.2)).toFixed(1);

  // Efficiency as percentage
  const efficiency = ((billableHours / totalHours) * 100).toFixed(1);

  // Weekly data (Mon–Fri)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weeklyData = days.map(day => {
    const hours = (7 + Math.random() * 3).toFixed(1); // 7–10 hours
    const billable = (hours * (0.75 + Math.random() * 0.2)).toFixed(1); // 75–95% billable
    return { day, hours: parseFloat(hours), billable: parseFloat(billable) };
  });

  return {
    totalHours: parseFloat(totalHours),
    billableHours: parseFloat(billableHours),
    efficiency: parseFloat(efficiency),
    weeklyData,
  };
}
,

  

  // Export functionality
  async exportReport(type, filters = {}) {
    // Simulate API call
    const reportData = {
      projects: await this.fetchProjects(),
      tasks: await this.getRecentTasks(),
      team: await this.fetchTeamSummary(),
      timeTracking: await this.fetchTimeTracking(),
      exportDate: new Date().toISOString(),
      reportType: type
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

const StatCard = ({ title, value, change, changeType, icon: Icon, isHighlighted = false, onClick }) => {
  const isPositive = changeType === "positive";
  const changeColor = isPositive ? "text-green-400" : "text-red-400";
  const ChangeIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div
      className={`p-4 rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg ${isHighlighted ? "bg-purple-600 text-white" : "bg-white text-gray-800"
        }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className={`text-sm font-medium ${isHighlighted ? "text-gray-100" : "text-gray-500"}`}>{title}</h3>
        <Icon size={16} className={isHighlighted ? "text-white" : "text-gray-400"} />
      </div>
      <div className="text-3xl font-extrabold mb-1">{value || 0}</div>
      <p className={`flex items-center text-xs font-semibold ${isHighlighted ? "text-gray-200" : changeColor}`}>
        <ChangeIcon size={12} className="mr-1" /> {change || "No change"}
      </p>
    </div>
  );
};

const WidgetCard = ({ title, children, className = "", style = {}, actions }) => (

  <div className={`bg-white p-4 rounded-xl shadow-md ${className}`} style={{ ...style }}>
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-sm font-semibold text-gray-800" style={{ color: style.color || "#111827" }}>
        {title}
      </h3>
      {actions && (
        <div className="flex gap-2">
          {actions}
        </div>
      )}
    </div>
    {children}
  </div>

);
const handleTaskClick = (taskId) => {
  navigate(`/TaskDetailsPage/${taskId}`);
};
const StatusBadge = ({ status }) => {
  const statusMap = {
    Completed: { bg: "bg-green-100", text: "text-green-700" },
    "In Progress": { bg: "bg-yellow-100", text: "text-yellow-700" },
    InProgress: { bg: "bg-yellow-100", text: "text-yellow-700" },
    Pending: { bg: "bg-red-100", text: "text-red-700" },
    active: { bg: "bg-green-100", text: "text-green-700" },
    busy: { bg: "bg-yellow-100", text: "text-yellow-700" },
    offline: { bg: "bg-gray-100", text: "text-gray-700" }
  };
  const { bg, text } = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {status}
    </span>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <Loader2 className="mx-auto h-8 w-8 text-purple-600 animate-spin mb-4" />
      <p className="text-sm text-gray-500">Loading dashboard data...</p>
    </div>
  </div>
);

const ExportModal = ({ isOpen, onClose, onExport }) => {
  const [exportType, setExportType] = useState('dashboard');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportType);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Export Report</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Report Type</label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="dashboard">Dashboard Summary</option>
              <option value="projects">Projects Report</option>
              <option value="team">Team Performance</option>
              <option value="time">Time Tracking</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const safeApiCall = async (apiFunction, errorPrefix) => {
  try {
    const result = await apiFunction();
    return { success: true, data: result };
  } catch (error) {
    console.error(`${errorPrefix}:`, error);
    return {
      success: false,
      data: null,
      error: `${errorPrefix}: ${error.message}`
    };
  }
};

const Dashboard = () => {

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  // Original states
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [projectProgress, setProjectProgress] = useState(null);
  const [nextMeeting, setNextMeeting] = useState(null);
  const [projectOptions, setProjectOptions] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);


  // Enhanced states
  const [teamMembers, setTeamMembers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [timeTracking, setTimeTracking] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  const getPriorityColor = (priority) => {
    const colors = {
      High: "text-red-600 bg-red-100",
      Medium: "text-yellow-600 bg-yellow-100",
      Low: "text-green-600 bg-green-100"
    };
    return colors[priority] || "text-gray-600 bg-gray-100";
  };

  const API_CONFIG = [
    { name: 'Dashboard Summary', fn: enhancedApiService.fetchDashboardSummary, setter: setStats },
    { name: 'Project Tasks', fn: enhancedApiService.getRecentTasks, setter: setProjectTasks },
    { name: 'Project Progress', fn: enhancedApiService.fetchProjectProgress, setter: setProjectProgress },
    { name: 'Next Meeting', fn: enhancedApiService.fetchNextMeeting, setter: setNextMeeting },
    { name: 'Team Members', fn: enhancedApiService.fetchTeamSummary, setter: setTeams },
    { name: 'Overdue Tasks', fn: enhancedApiService.fetchOverdueTasks, setter: setOverdueTasks },
    { name: 'Top Performers', fn: enhancedApiService.fetchTopPerformers, setter: setTopPerformers },
    { name: 'Risk Analysis', fn: enhancedApiService.fetchRiskAnalysis, setter: setRiskAnalysis },
    { name: 'Time Tracking', fn: enhancedApiService.fetchTimeTracking, setter: setTimeTracking },
    { name: 'Notifications', fn: enhancedApiService.fetchNotifications, setter: setNotifications },
  ];

  const loadDashboardData = async () => {
    setLoading(true);
    const apiCalls = API_CONFIG.map(item => safeApiCall(item.fn, `Failed to load ${item.name}`));
    const results = await Promise.all(apiCalls);
    const newErrors = [];

    results.forEach((result, index) => {
      const { name, setter } = API_CONFIG[index];
      if (result.success && result.data) {
        setter(result.data);
      } else {
        newErrors.push(result.error);
        if (name.includes('Tasks') || name.includes('Members') || name.includes('Performers')) {
          setter([]);
        } else {
          setter(null);
        }
      }
    });

    setErrors(newErrors);
    setLoading(false);
  };

  const refreshDashboard = () => {
    loadDashboardData();
  };

  const handleExport = async (type) => {
    try {
      await enhancedApiService.exportReport(type);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // Main data fetching effect
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Effect to load project options and set the first one as selected
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await enhancedApiService.fetchProjects();
        setProjectOptions(res || []);
        if (res && res.length > 0) {
          setSelectedProjectId(res[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };
    loadProjects();
  }, []);

  // Effect to fetch analytics for the selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setAnalyticsData([]);
      return;
    }

    const loadAnalytics = async () => {
      try {
        const res = await enhancedApiService.fetchProjectAnalyticsById(selectedProjectId);
        setAnalyticsData(res);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setAnalyticsData([]);
      }
    };
    loadAnalytics();
  }, [selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectProgress(null);
      return;
    }

    const loadProgress = async () => {
      try {
        const res = await enhancedApiService.fetchProjectProgress(selectedProjectId);
        setProjectProgress(res);
      } catch (err) {
        console.error("Failed to fetch project progress:", err);
        setProjectProgress(null);
      }
    };

    loadProgress();
  }, [selectedProjectId]);

  if (loading) {
    return (
      <main className="p-6 w-full bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl min-h-screen">
        <h1 className="text-2xl font-bold text-purple-900 mb-2">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-4">Plan, prioritize, and accomplish your tasks with ease.</p>
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="p-6 w-full bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl min-h-screen">
      <div className="flex justify-between items-center mb-4 sm:">
        <div>
          <h1 className="text-2xl font-bold text-black mb-2">Dashboard</h1>
          <p className="text-sm text-gray-500">Advanced project management with deep insights and analytics.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4 sm:w-2" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={refreshDashboard}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Refreshing...</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-sm">Failed to load some data</p>
              <p className="text-xs mt-1">{errors.length} service(s) are currently unavailable.</p>
              <details className="mt-2">
                <summary className="text-xs cursor-pointer hover:underline">Show details</summary>
                <ul className="mt-1 text-xs space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-red-700">• {error}</li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Enhanced Stats Cards */}
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects}
          change="Increased from last month"
          changeType="positive"
          icon={BarChart}
          isHighlighted
        />
        <StatCard
          title="Teams"
          value={teams?.length}
          change={`${teams?.filter(t => t.status === 'active' || 2)?.length} active`}
          icon={Users}
          changeType="positive"
        />
        <StatCard
          title="Overdue Tasks"
          value={overdueTasks?.length}
          change="Needs attention"
          icon={AlertTriangle}
          changeType="negative"
        />
        <StatCard
          title="Efficiency"
          value={`${timeTracking?.efficiency || 0}%`}
          change="Weekly average"
          icon={Zap}
          changeType="positive"
        />

        {/* Project Analytics (Enhanced) */}
        <WidgetCard
          title="Project Analytics"
          className="col-span-1 md:col-span-2"
          actions={[
            <button key="view" className="text-blue-600 hover:text-blue-800">
              <Eye className="w-4 h-4" />
            </button>
          ]}
        >
          <div className="mb-3">
            <select
              className="w-full p-2 rounded-lg   border border-gray-300 text-sm"
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="" disabled>Select a project</option>
              {projectOptions.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName}
                </option>
              ))}
            </select>
          </div>

          {selectedProjectId ? (
            analyticsData && analyticsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsBarChart data={analyticsData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} style={{ fill: '#6B7280' }} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="completed" name="Completed" fill={COLORS.primary} barSize={20} radius={[10, 10, 0, 0]} />
                  <Bar dataKey="inProgress" name="In Progress" fill={COLORS.inProgress} barSize={20} radius={[10, 10, 0, 0]} />
                  <Bar dataKey="pending" name="Pending" fill={COLORS.pending} barSize={20} radius={[10, 10, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-16">
                <BarChart2 className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No analytics data available</p>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <BarChart2 className="mx-auto w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">Select a project to view analytics</p>
            </div>
          )}
        </WidgetCard>

        {/* Project Progress */}
        <WidgetCard title="Project Progress">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Project Selector */}
            <select
              className="mb-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 w-30"
              value={selectedProjectId || ""}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="" disabled>Select a project</option>
              {projectOptions.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.projectName}
                </option>
              ))}
            </select>

            {projectProgress ? (
              <>
                <div className="relative w-36 h-36">
                  <svg
                    viewBox="0 0 36 36"
                    className="w-full h-full transform -rotate-90"
                  >
                    <path
                      className="stroke-gray-200"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="stroke-purple-600 drop-shadow-md transition-all duration-700 ease-out"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${projectProgress.progressPercentage || 0}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">
                      {projectProgress.progressPercentage || 0}%
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">
                    Project Completed
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {projectProgress.completedTasks || 0} / {projectProgress.totalTasks || 0} tasks
                  </p>
                </div>
              </>
            ) : selectedProjectId ? (
              <div className="py-8 px-4">
                <Loader2 className="mx-auto w-8 h-8 text-gray-400 animate-spin mb-2" />
                <p className="text-gray-500 text-sm">Loading progress...</p>
              </div>
            ) : (
              <div className="py-8 px-4">
                <BarChart className="mx-auto w-10 h-10 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">Select a project to view progress</p>
              </div>
            )}
          </div>
        </WidgetCard>

        {/* Next Meeting */}
        {/* <WidgetCard title="Next Meeting">
          {nextMeeting ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{nextMeeting.title}</h4>
                  <p className="text-xs text-gray-500">{nextMeeting.date} at {nextMeeting.time}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {nextMeeting.attendees} attendees
                </span>
                <button className="text-purple-600 hover:text-purple-800 font-medium">
                  Join Meeting
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No upcoming meetings</p>
            </div>
          )}
        </WidgetCard> */}

        {/* Overdue Tasks */}
 
    


        <WidgetCard title="Overdue Tasks">
          {overdueTasks && overdueTasks.length > 0 ? (
            <div className="space-y-3">
              {overdueTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="relative p-4 bg-white border border-red-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  {/* Priority indicator line */}
                  <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${getPriorityLineColor(task.priority)}`}></div>

                  <div className="flex items-start justify-between">
                    {/* Task Title & Assignee */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-gray-800 truncate mb-1">{task.title}</h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-500" />
                        <span className="font-medium text-red-600">{task.daysOverdue} days overdue</span>
                      </div>
                    </div>

                    {/* Priority & Assignee */}
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <p className="text-xs text-gray-600 mt-1">{task.assignee}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CheckCircle className="mx-auto w-8 h-8 text-green-500 mb-2" />
              <p className="text-gray-600 text-sm font-medium">No overdue tasks!</p>
              <p className="text-gray-400 text-xs">All tasks are on track.</p>
            </div>
          )}
        </WidgetCard>


<WidgetCard title="Recent Notifications" className="col-span-1 md:col-span-2">
      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification._id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200
                ${notification.read ? 'bg-gray-100 text-gray-500' : 'bg-white shadow-sm hover:bg-gray-50'}`}
            >
              <div className="flex items-start gap-3">
                {/* Read/Unread Status Indicator */}
                {!notification.read && <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-purple-500" />}

                <div className="flex-1">
                  <h4 className={`font-medium text-sm ${notification.read ? 'text-gray-500' : 'text-gray-900'}`}>
                    {notification.message}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.timestamp || notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <BellOff className="mx-auto w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">No new notifications</p>
        </div>
      )}
    </WidgetCard>






        {/* Recent Tasks */}
       
        {/* Teams */}
        <div className="col-span-1 md:col-span-2">
          <WidgetCard title="Teams Overview">
            {teams && teams.length > 0 ? (
              <div className="space-y-3">
                {teams.slice(0, 8).map((team) => (
                  <div
                    key={team.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Left Section: Team Name and Lead */}
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{team.teamName}</h4>
                        <p className="text-xs text-gray-500 truncate">
                          <span className="font-medium text-gray-700">Lead:</span> {team.teamLead}
                        </p>
                      </div>
                    </div>

                    {/* Right Section: Member Count and Projects */}
                    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 ml-auto">
                      <div className="bg-gray-100 px-2 py-1 rounded-full flex-shrink-0">
                        <p className="text-xs font-medium text-gray-800 whitespace-nowrap">{team.membersCount} members</p>
                      </div>

                      {/* Projects Display Logic */}
                      {team.assignedProjects.length > 1 ? (
                        <Disclosure>
                          {({ open, close }) => (
                            <div className="relative">
                              <Disclosure.Button className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 transition-colors flex-shrink-0">
                                <Briefcase className="h-4 w-4" />
                                <span className="whitespace-nowrap">{team.assignedProjects.length} Projects</span>
                                {open ? (
                                  <ChevronUp className="w-4 h-4 transition-transform" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 transition-transform" />
                                )}
                              </Disclosure.Button>
                              <Disclosure.Panel className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                                <div className="flex justify-end pb-2">
                                  <button
                                    type="button"
                                    onClick={close}
                                    className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <ul className="space-y-1">
                                  {team.assignedProjects.map((project, index) => (
                                    <li key={index} className="text-xs text-gray-600 truncate">
                                      {project}
                                    </li>
                                  ))}
                                </ul>
                              </Disclosure.Panel>
                            </div>
                          )}
                        </Disclosure>
                      ) : team.assignedProjects.length > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Briefcase className="h-4 w-4 flex-shrink-0" />
                          <p className="font-medium truncate">
                            {team.assignedProjects.join(", ")}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Briefcase className="h-4 w-4 flex-shrink-0" />
                          <p className="font-medium whitespace-nowrap">No Projects</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">No teams available</p>
              </div>
            )}
          </WidgetCard>
        </div>

 <WidgetCard title="Recent Tasks" className="col-span-1 md:col-span-2">
          {projectTasks && projectTasks.length > 0 ? (
            <div className="space-y-3">
              {projectTasks.slice(0, 8).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${task.status === 'Completed' ? 'bg-green-500' :
                      task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    <div>
                      <h4 className="font-medium text-sm text-gray-800 ">
                        {task.title.length > 30
                          ? task.title.substring(0, Math.ceil(task.title.length / 4)) + '...'
                          : task.title}
                      </h4>
                      <p className="text-xs text-gray-500">{task.assignee} • Due {task.dueDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="mx-auto w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No tasks available</p>
            </div>
          )}
        </WidgetCard>


        {/* Time Tracking */}
        {/* <WidgetCard title="Time Tracking" className="col-span-1 md:col-span-2">
          {timeTracking ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{timeTracking.totalHours}h</p>
                  <p className="text-xs text-gray-500">Total Hours</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{timeTracking.billableHours}h</p>
                  <p className="text-xs text-gray-500">Billable</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">{timeTracking.efficiency}%</p>
                  <p className="text-xs text-gray-500">Efficiency</p>
                </div>
              </div>
              
              {timeTracking.weeklyData && (
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={timeTracking.weeklyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} style={{ fill: '#6B7280', fontSize: 12 }} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="hours" 
                      stroke={COLORS.primary} 
                      fill={COLORS.primary} 
                      fillOpacity={0.1}
                      name="Total Hours"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="billable" 
                      stroke={COLORS.success} 
                      fill={COLORS.success} 
                      fillOpacity={0.2}
                      name="Billable Hours"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No time tracking data</p>
            </div>
          )}
        </WidgetCard> */}

        {/* Top Performers */}
        {/* <WidgetCard title="Top Performers">
          {topPerformers && topPerformers.length > 0 ? (
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {index === 0 ? <Crown className="w-3 h-3" /> : index + 1}
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-purple-600">
                      {performer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-800">{performer.name}</h4>
                    <p className="text-xs text-gray-500">{performer.completedTasks} tasks • {performer.efficiency}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="mx-auto w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">No performance data</p>
            </div>
          )}
        </WidgetCard> */}




      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </main>
  );
};

export default Dashboard;