const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const User = require("../models/userModel");
const Team = require("../models/teamModel");
const Meeting = require("../models/meetingModel"); // if you have one

// ------------------------------
// GET /api/dashboard/summary
// ------------------------------
const getDashboardSummary = asyncHandler(async (req, res) => {
  // Count projects
  const totalProjects = await Project.countDocuments({ deletedAt: null });
  const activeProjects = await Project.countDocuments({ status: "Active", deletedAt: null });
  const completedProjects = await Project.countDocuments({ status: "Completed", deletedAt: null });

  // Count tasks
  const totalTasks = await Task.countDocuments({ deletedAt: null });
  const completedTasks = await Task.countDocuments({ status: "Completed", deletedAt: null });
  const pendingTasks = await Task.countDocuments({ 
    status: { $ne: "COMPLETED" }, 
    deletedAt: null 
  });

  res.status(200).json({
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    completedTasks,
    pendingTasks,
  });
});


// ------------------------------
// GET /api/dashboard/analytics
// ------------------------------
const getProjectAnalytics = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    res.status(400);
    throw new Error("Project ID is required");
  }

  const analytics = await Task.aggregate([
    {
      $match: {
        projectName: projectId,            
        status: "Completed",
        deletedAt: null
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$projectDeliveryDate" } }, 
        completed: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 } // sort by date ascending
    }
  ]);

  // Format response
  const formatted = analytics.map(item => ({
    date: item._id,
    completed: item.completed
  }));

  res.status(200).json(formatted);
});




const getRandomStatus = () => {
  const statuses = ["active", "busy", "offline"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getTeamMembersWithStats = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  // Ensure team exists
  const team = await Team.findById(teamId).populate("members", "name email role");
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  const members = await Promise.all(
    team.members.map(async (member) => {
      // Count tasks
      const totalTasks = await Task.countDocuments({
        assignedTo: member._id,
        deletedAt: null,
      });

      const completedTasks = await Task.countDocuments({
        assignedTo: member._id,
        status: "Completed",
        deletedAt: null,
      });

      // Efficiency (% of completed tasks out of total)
      const efficiency =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        id: member._id,
        name: member.name,
        role: member.role || "employee", // fallback role
        status: getRandomStatus(), // frontend expects "active | busy | offline"
        tasksCompleted: completedTasks,
        efficiency,
      };
    })
  );

  res.json(members);
});

const getAllTeamLeadsStats = asyncHandler(async (req, res) => {
  try {
    const teamLeads = await User.find({ role: "TEAM_LEAD" }).lean();

    const results = await Promise.all(
      teamLeads.map(async (lead) => {
        const team = await Team.findOne({ teamLeader: lead._id }).populate("members", "name email").lean();

        let totalTasks = 0;
        let completedTasks = 0;

        if (team) {
          const tasks = await Task.find({ assignedTo: { $in: team.members.map((m) => m._id) } });

          totalTasks = tasks.length;
          completedTasks = tasks.filter((t) => t.status === "Completed").length;
        }

        const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          id: lead._id,
          name: lead.name,
          email: lead.email,
          role: lead.role,
          team: team ? { id: team._id, name: team.name } : null,
          membersCount: team ? team.members.length : 0,
          tasksCompleted: completedTasks,
          totalTasks,
          efficiency,
        };
      })
    );

    res.json({ teamLeads: results });
  } catch (error) {
    console.error("Error fetching team leads stats:", error);
    res.status(500).json({ message: "Server error fetching team leads stats" });
  }
});

const getTeamSummary = asyncHandler(async (req, res) => {
  try {
    const teams = await Team.find({ deletedAt: null })
      .populate("teamLeader", "name email") // populate leader
      .populate("members", "name email") // populate members
      .lean();

    const teamData = await Promise.all(
      teams.map(async (team) => {
        // find all projects that include this team
       const assignedProjects = await Project.find({
  teams: team._id,
  deletedAt: null,
}).select("projectName");


        return {
          id: team._id,
          teamName: team.teamName, // ✅ correct field from schema
          teamLead: team.teamLeader ? team.teamLeader.name : "Unassigned",
          membersCount: team.members ? team.members.length : 0,
          assignedProjects: assignedProjects.map((p) => p.projectName),

        };
      })
    );

    res.status(200).json({ teams: teamData });
  } catch (error) {
    console.error("Team summary error:", error);
    res.status(500).json({ message: "Failed to fetch team summary" });
  }
});


const getOverdueTasks = asyncHandler(async (req, res) => {
  try {
    const today = new Date();

    const overdueTasks = await Task.find({
      deletedAt: null,
      status: "OverDue",   
    })
      .populate("assignedTo", "name") 
      .lean();

    const formattedTasks = overdueTasks.map((task) => {
      let daysOverdue = 0;
      if (task.taskEndDate) {
        daysOverdue = Math.ceil(
          (today - new Date(task.taskEndDate)) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        id: task._id,
        title: task.taskList,
        assignee: task.assignedTo && task.assignedTo.length > 0 
          ? task.assignedTo.map((user) => user.name)
          : ["Unassigned"],
        priority: task.priority || "Normal",
        status: task.status,
        daysOverdue: daysOverdue > 0 ? daysOverdue : 0, // prevent negative values
      };
    });

    res.status(200).json({ overdueTasks: formattedTasks });
  } catch (error) {
    console.error("Error fetching overdue tasks:", error);
    res.status(500).json({ message: "Failed to fetch overdue tasks" });
  }
});

 const getProjectProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the project
  const project = await Project.findById(id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Fetch tasks for this project
  const tasks = await Task.find({
    projectName: id,
    deletedAt: null,
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;

  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.status(200).json({
    projectId: id,
    projectName: project.projectName,
    progressPercentage,
    completedTasks,
    totalTasks,
  });
});





const getTaskStats = asyncHandler(async (req, res) => {
  const totalTasks = await Task.countDocuments({ deletedAt: null });
  const completedTasks = await Task.countDocuments({
    status: "Completed",
    deletedAt: null,
  });

  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  res.status(200).json({
    total: totalTasks,
    completed: completedTasks,
    completionRate,
  });
});



















































































































// ------------------------------
// GET /api/dashboard/team-collaboration
// ------------------------------
const getTeamCollaboration = asyncHandler(async (req, res) => {
  const teamMembers = await User.aggregate([
    {
      $lookup: {
        from: "tasks",
        localField: "_id",
        foreignField: "assignedTo",
        as: "currentTask",
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        currentTask: { $arrayElemAt: ["$currentTask", 0] },
      },
    },
  ]);

  const formattedTeam = teamMembers.map((member) => ({
    name: member.name,
    status: member.currentTask ? member.currentTask.status : "Pending",
    task: member.currentTask
      ? `Working on ${member.currentTask.taskList}`
      : "No current task assigned",
  }));

  res.status(200).json(formattedTeam);
});

// ------------------------------
// GET /api/dashboard/project-tasks
// ------------------------------
const getRecentTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ deletedAt: null })
    .populate("assignedTo", "name") // populate user names
    .sort({ createdAt: -1 }) // newest first
    .limit(5);

  // Format response exactly like your example
  const formatted = tasks.map(task => ({
    id: task._id, // keep string id
    title: task.taskList, // task name field
    status: task.status || "Pending",
    priority: task.priority || "Medium",
    assignee: task.assignedTo && task.assignedTo.length > 0
      ? task.assignedTo.map(user => user.name).join(", ")
      : "Unassigned",
    dueDate: task.endDate ? task.taskendDate.toISOString().split("T")[0] : null
  }));

  res.status(200).json(formatted);
});



// ------------------------------
// GET /api/dashboard/project-progress
// ------------------------------


const fetchProjectAnalyticsById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    throw new Error("Project ID is required");
  }

  const analytics = await Task.aggregate([
    {
      $match: {
        projectName: new mongoose.Types.ObjectId(id), 
        deletedAt: null
      }
    },
    {
      $addFields: {
        week: { $isoWeek: "$taskStartDate" } 
      }
    },
    {
      $group: {
        _id: { week: "$week", status: "$status" },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: "$_id.week",
        completed: {
          $sum: {
            $cond: [{ $eq: ["$_id.status", "Completed"] }, "$count", 0]
          }
        },
        inProgress: {
          $sum: {
            $cond: [{ $eq: ["$_id.status", "InProgress"] }, "$count", 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ["$_id.status", "ToDo"] }, "$count", 0]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const formatted = analytics.map((entry, idx) => ({
    date: `Week ${idx + 1}`,
    completed: entry.completed,
    inProgress: entry.inProgress,
    pending: entry.pending
  }));

  res.json(formatted);
});
// ------------------------------
// GET /api/dashboard/next-meeting
// ------------------------------
const getNextMeeting = asyncHandler(async (req, res) => {
  // If you have a Meeting model, fetch the actual next meeting
  let nextMeeting;
  if (Meeting) {
    nextMeeting = await Meeting.findOne({ date: { $gte: new Date() } }).sort({ date: 1 });
  }

  if (nextMeeting) {
    res.status(200).json({
      title: nextMeeting.title,
      description: nextMeeting.description,
      date: nextMeeting.date,
      time: nextMeeting.time,
    });
  } else {
    // fallback placeholder
    const currentDate = new Date();
    const nextMeetingDate = new Date(currentDate);
    nextMeetingDate.setDate(currentDate.getDate() + 1);

    res.status(200).json({
      title: "Meeting with Arc Company",
      description: "Quarterly planning session",
      date: nextMeetingDate.toISOString(),
      time: "02:00 PM - 04:00 PM",
    });
  }
});

// ------------------------------
// GET /api/dashboard/stats (legacy)
// ------------------------------
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalProjects, totalTasks] = await Promise.all([
    User.countDocuments({ deletedAt: null }),
    Project.countDocuments({ deletedAt: null }),
    Task.countDocuments({ deletedAt: null }),
  ]);

  const completedTasks = await Task.countDocuments({ status: "Completed" });
  const inProgressTasks = await Task.countDocuments({ status: "InProgress" });

  res.status(200).json({
    totalUsers,
    totalProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
  });
});

// ------------------------------
// GET /api/dashboard/collaborations
// ------------------------------
const getCollaborativeProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ deletedAt: null })
    .populate("teams", "teamName")
    .select("projectName teams");

  const collaborativeProjects = projects
    .filter((p) => p.teams.length >= 2)
    .map((p) => ({
      projectName: p.projectName,
      teams: p.teams.map((team) => team.teamName),
    }));

  res.status(200).json({ collaborativeProjects });
});

module.exports = {
  getDashboardSummary,
  getProjectAnalytics,
  getTeamCollaboration,
  getRecentTasks,
  getProjectProgress,
  getNextMeeting,
  getDashboardStats,
  getCollaborativeProjects,
  fetchProjectAnalyticsById,
  getTeamMembersWithStats,
  getAllTeamLeadsStats,
  getTeamSummary,
  getOverdueTasks,
  getTaskStats,
};
