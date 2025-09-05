import React, { useEffect, useState } from "react";
import {
    Users,
    Target,
    Calendar,
    Clock,
    TrendingUp,
    Download,
    RefreshCw,
} from "lucide-react";

// Assuming these are the functions from your services file
// and they now accept teamId as an argument
import {
    fetchTeamOverview,
    fetchTeamMembers,
    fetchSprintProgress,
    fetchRecentActivities,
    fetchUpcomingDeadlines,
    fetchTeamSkills
} from "../../Services/teamLeadServices";

// Utility Components
const StatCard = ({ title, value, change, changeType, icon: Icon, color = "purple", onClick, subtitle }) => {
    const isPositive = changeType === "positive";
    const ChangeIcon = TrendingUp;
    const colorClasses = {
        purple: "bg-purple-600 text-white",
        blue: "bg-blue-600 text-white",
        green: "bg-green-600 text-white",
        orange: "bg-orange-600 text-white"
    };
    return (
        <div
            className={`p-6 rounded-xl shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${color ? colorClasses[color] : "bg-white text-gray-800"
                }`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium opacity-90">{title}</p>
                    {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
                </div>
                <Icon className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-3xl font-bold mb-2">{value}</div>
            {change && (
                <div className={`flex items-center text-sm ${color ? 'text-white opacity-90' : 'text-green-500'}`}>
                    <ChangeIcon className="w-4 h-4 mr-1" />
                    {change}
                </div>
            )}
        </div>
    );
};

const WidgetCard = ({ title, children, actions, className = "" }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {actions && <div className="flex gap-2">{actions}</div>}
        </div>
        {children}
    </div>
);

const StatusBadge = ({ status }) => {
    const statusStyles = {
        active: "bg-green-100 text-green-800",
        busy: "bg-yellow-100 text-yellow-800",
        offline: "bg-gray-100 text-gray-800",
        "In Progress": "bg-blue-100 text-blue-800",
        "Not Started": "bg-red-100 text-red-800",
        Completed: "bg-green-100 text-green-800"
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || statusStyles.offline}`}>
            {status}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const priorityStyles = {
        High: "bg-red-100 text-red-800 border-red-200",
        Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        Low: "bg-green-100 text-green-800 border-green-200"
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded border ${priorityStyles[priority] || priorityStyles.Medium}`}>
            {priority}
        </span>
    );
};

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
        <div className="text-center">
            <svg className="mx-auto h-8 w-8 text-purple-600 animate-spin mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-500">Loading team dashboard...</p>
        </div>
    </div>
);

// Main Dashboard Component
const TeamLeadDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [teamId, setTeamId] = useState(null);
    const [teamOverview, setTeamOverview] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [sprintProgress, setSprintProgress] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [teamSkills, setTeamSkills] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Function to load all data
    const loadDashboardData = async (currentTeamId) => {
        if (!currentTeamId) return;
        setLoading(true);
        try {
            const [
                overview,
                members,
                sprint,
                activities,
                deadlines,
                skills
            ] = await Promise.all([
                fetchTeamOverview(currentTeamId),
                fetchTeamMembers(currentTeamId),
                fetchSprintProgress(currentTeamId),
                fetchRecentActivities(currentTeamId),
                fetchUpcomingDeadlines(currentTeamId),
                fetchTeamSkills(currentTeamId)
            ]);

            setTeamOverview(overview);
            setTeamMembers(members);
            setSprintProgress(sprint);
            setRecentActivities(activities);
            setUpcomingDeadlines(deadlines);
            setTeamSkills(skills);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };
    
    // Function to handle refresh
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData(teamId);
    };

    // Use an effect to read from sessionStorage once on mount
    useEffect(() => {
        const storedTeamId = sessionStorage.getItem("teamId");
        if (storedTeamId) {
            setTeamId(storedTeamId);
            loadDashboardData(storedTeamId);
        } else {
            console.error("Team ID not found in session storage.");
            setLoading(false); // Stop loading if no teamId is found
        }
    }, []); // Empty dependency array means this runs only once on mount

    if (loading) {
        return (
            <main className="p-6 w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 min-h-screen">
                <LoadingSpinner />
            </main>
        );
    }

    if (!teamId) {
        return (
            <main className="p-6 w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 min-h-screen flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <p className="text-xl font-semibold mb-2">Error</p>
                    <p>Team ID not found. Please log in again.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="p-6 w-full bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-xl min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Lead Dashboard</h1>
                    <p className="text-gray-600">Manage your team's performance and productivity</p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-3">
                    {/* Export Report Button */}
                    <button className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-sm whitespace-nowrap">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export Report</span>
                    </button>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex-1 sm:flex-initial px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-sm whitespace-nowrap"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Key Metrics */}
                <StatCard
                    title="Total Team Members"
                    value={teamOverview?.totalMembers || 0}
                    change={`${teamOverview?.activeMembers || 0} active`}
                    changeType="positive"
                    icon={Users}
                    color="purple"
                    subtitle="Across all projects"
                />
                <StatCard
                    title="Team Efficiency"
                    value={`${teamOverview?.teamEfficiency || 0}%`}
                    change="↑ 5% from last week"
                    changeType="positive"
                    icon={TrendingUp}
                    color="green"
                    subtitle="Overall performance"
                />
                <StatCard
                    title="Sprint Progress"
                    value={`${sprintProgress?.progress || 0}%`}
                    change={`${sprintProgress?.completedStoryPoints || 0}/${sprintProgress?.totalStoryPoints || 0} points`}
                    changeType="positive"
                    icon={Target}
                    color="blue"
                    subtitle={sprintProgress?.sprintName || "Current Sprint"}
                />
                <StatCard
                    title="Avg Workload"
                    value={`${teamOverview?.avgWorkload || 0}%`}
                    change="Optimal range"
                    changeType="positive"
                    icon={Users}
                    color="orange"
                    subtitle="Team capacity"
                />

                {/* Team Members */}
                <WidgetCard title="Team Members" className="col-span-1 md:col-span-2">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {teamMembers.map(member => (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-semibold text-purple-600">
                                            {member.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{member.name}</h4>
                                        <p className="text-sm text-gray-600">{member.role}</p>
                                        <p className="text-xs text-gray-500">{member.lastActive}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <StatusBadge status={member.status} />
                                    <p className="text-sm text-gray-600 mt-1">{member.currentTasks} active tasks</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full transition-all"
                                                style={{ width: `${member.workload}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500">{member.workload}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </WidgetCard>

                {/* Upcoming Deadlines */}
                <WidgetCard title="Upcoming Deadlines" className="col-span-1 md:col-span-2">
                    <div className="space-y-4">
                        {upcomingDeadlines.map(deadline => (
                            <div key={deadline.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-800">{deadline.title}</h4>
                                    <p className="text-sm text-gray-600">{deadline.assignee}</p>
                                </div>
                                <div className="text-right">
                                    <PriorityBadge priority={deadline.priority} />
                                    <p className="text-sm text-gray-600 mt-1">{deadline.daysLeft} days left</p>
                                    <StatusBadge status={deadline.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                </WidgetCard>

                {/* Recent Activities */}
                <WidgetCard title="Recent Activities" className="col-span-1 md:col-span-2">
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {recentActivities.length === 0 && (
                            <div className="text-gray-500 text-center py-12">No recent activities found.</div>
                        )}
                        {recentActivities.map(activity => (
                            <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg">
                                <div className={`p-2 rounded-full ${activity.color ? activity.color.replace('text-', 'bg-').replace('-600', '-100') : 'bg-gray-100'}`}>
                                    <Clock className={`w-4 h-4 ${activity.color || 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">
                                        <span className="font-semibold">{activity.user}</span> {activity.action}{' '}
                                        <span className="font-medium">{activity.target}</span>
                                    </p>
                                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </WidgetCard>

                {/* Team Skills Matrix */}
                <WidgetCard title="Team Skills Overview" className="col-span-1 md:col-span-2">
                    <div className="space-y-4">
                        {teamSkills.map(skill => (
                            <div key={skill.skill} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                            style={{ width: `${skill.level}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600 w-12 text-right">{skill.level}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </WidgetCard>
            </div>
        </main>
    );
};

export default TeamLeadDashboard;