const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
const Team = require("../models/teamModel");
dotenv.config();
const Task = require("../models/taskModel");
const Project = require ("../models/projectModel");


// Utility to calculate team statistics
async function getTeamOverview(teamId) {
  const team = await Team.findById(teamId).populate('members');
  if (!team) throw new Error('Team not found');

  const totalMembers = team.members.length;
  const onLeaveCount = team.members.filter(m => m.status === 'onLeave').length; // adjust based on your user model
  const activeMembers = totalMembers - onLeaveCount;

  // Example workloads, efficiencies
  const tasks = await Task.find({ teams: teamId });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const workloads = team.members.map(member => {
    const memberTasks = tasks.filter(t => t.assignedTo.includes(member._id));
    const activeTasks = memberTasks.filter(t => t.status === 'InProgress').length;
    return activeTasks * 15; 
  });
  const avgWorkload = workloads.length ? Math.round(workloads.reduce((a,b) => a+b, 0) / workloads.length) : 0;
  const teamEfficiency = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalMembers,
    activeMembers,
    onLeave: onLeaveCount,
    teamEfficiency,
    avgWorkload
  };
}

exports.getTeamOverview = async (req, res) => {
  try {
    const { teamId } = req.params;
    const overview = await getTeamOverview(teamId);
    res.json(overview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId)
      .populate('members')
      .populate('teamLeader', 'name');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Gather member task data
    const tasks = await Task.find({ teams: teamId });
    const members = await Promise.all(team.members.map(async member => {
      const currTasks = tasks.filter(t => t.assignedTo.includes(member._id) && t.status === 'InProgress').length;
      const compTasks = tasks.filter(t => t.assignedTo.includes(member._id) && t.status === 'Completed').length;
      // Example: Workload/effectiveness demo (replace logic as needed)
      const workload = currTasks * 20;
      const efficiency = (compTasks + currTasks) > 0 ? Math.round((compTasks/(compTasks + currTasks))*100) : 0;
      return {
        id: member._id,
        name: member.name,
        role: member.role,
        status: member.status || 'active',
        currentTasks: currTasks,
        completedTasks: compTasks,
        workload,
        efficiency,
        lastActive: member.lastActive ? `${Math.floor((Date.now() - new Date(member.lastActive))/60000)} min ago` : 'unknown',
        skills: member.skills || [],
        avatar: member.avatarUrl || `/api/placeholder/40/40`
      };
    }));

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSprintProgress = async (req, res) => {
  try {
    const { teamId } = req.params;
    // Simplified: filter tasks for current sprint (based on date)
    const now = new Date();
    const sprintStart = new Date(now); sprintStart.setDate(now.getDate() - 7);
    const sprintEnd = new Date(now); sprintEnd.setDate(now.getDate() + 7);

    const sprintTasks = await Task.find({
      teams: teamId,
      taskStartDate: { $gte: sprintStart, $lte: sprintEnd }
    });

    const total = sprintTasks.length;
    const completed = sprintTasks.filter(t => t.status === "Completed").length;
    const inProgress = sprintTasks.filter(t => t.status === "InProgress").length;
    const remaining = total - completed - inProgress;

    res.json({
      sprintName: "Current Sprint",
      startDate: sprintStart.toISOString().slice(0, 10),
      endDate: sprintEnd.toISOString().slice(0, 10),
      progress: total ? Math.round((completed/total) * 100) : 0,
      totalStoryPoints: total,
      completedStoryPoints: completed,
      inProgressStoryPoints: inProgress,
      remainingStoryPoints: remaining,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    // Extend with proper audit/history logging if desired
    const activities = []; // You may retrieve these from an ActivityLog collection
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUpcomingDeadlines = async (req, res) => {
  try {
    const { teamId } = req.params;
    const now = new Date();
    const tasks = await Task.find({ teams: teamId, taskEndDate: { $gte: now } }).populate('assignedTo', 'name');
    const result = tasks.map(task => ({
      id: task._id,
      title: task.taskList,
      assignee: task.assignedTo?.[0]?.name || 'Unassigned',
      dueDate: task.taskEndDate,
      priority: task.priority,
      status: task.status,
      daysLeft: Math.ceil((new Date(task.taskEndDate) - now) / (1000*60*60*24))
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeamSkills = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findById(teamId).populate('members');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    // Aggregate skills
    const skillMap = {};
    (team.members || []).forEach(user => {
      (user.skills || []).forEach(skill => {
        if (!skillMap[skill]) skillMap[skill] = 0;
        skillMap[skill] += 1;
      });
    });

    const totalMembers = team.members.length || 1;
    // Example: percent of team with skill
    const skills = Object.entries(skillMap).map(([skill, count]) => ({
      skill,
      level: Math.round((count/totalMembers) * 100),
    }));
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasksByTeamLead = async (req, res) => {
  try {
    const { teamLeadId } = req.params;

    // Find the team where this user is the team lead
    const team = await Team.findOne({ teamLeader: teamLeadId }).populate("members");
    if (!team) return res.status(404).json({ message: "No team found for this team lead" });

    // Collect all team member IDs
    const memberIds = (team.members || []).map((m) => m._id);

    // Find all tasks assigned to these members
    const tasks = await Task.find({ assignedTo: { $in: memberIds }, deletedAt: null })
      .populate("assignedTo", "name email")
      .populate("projectName", "projectName status")
      .populate("createdBy", "name email");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate("assignedTo", "name email")
      .populate("projectName", "projectName status");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.fetchProjectsByTeamLead = async (req, res) => {
  const { teamLeadId } = req.params;

  if (!teamLeadId) {
    res.status(400);
    throw new Error("Team Lead ID is required");
  }

  // Step 1: Find all teams led by this Team Lead
  const teams = await Team.find({ teamLeader: teamLeadId, deletedAt: null }).select("_id");

  if (!teams || teams.length === 0) {
    return res.status(200).json({ projects: [] });
  }

  const teamIds = teams.map((t) => t._id);

  // Step 2: Find all projects that include any of these teams
  const projects = await Project.find({
    teams: { $in: teamIds },
    deletedAt: null,
  })
    .populate("members", "name email role")  
    .populate("teams", "name teamLeader")    
    .populate("createdBy", "name email");    

  res.status(200).json({ projects });
};

exports.fetchProjectsOfTeammates = async (req, res) => {
  const { teamLeadId } = req.params;

  // Find the team of the given team lead
  const team = await Team.findOne({ teamLeader: teamLeadId, deletedAt: null }).populate("members");

  if (!team) {
    res.status(404);
    throw new Error("Team not found for this Team Lead");
  }

  const teammateIds = team.members.map((member) => member._id);

  // Find projects where at least one teammate is a member
  const projects = await Project.find({
    members: { $in: teammateIds },
    deletedAt: null,
  })
    .populate("members", "name email role")
    .populate("teams", "name")
    .populate("createdBy", "name email");

  res.status(200).json({ projects });
};
