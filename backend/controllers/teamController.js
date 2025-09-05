const asyncHandler = require("express-async-handler");
const Team = require("../models/teamModel");
const createLog = require("../utils/createLog");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Task = require("../models/taskModel");

  const Role = Object.freeze({
      superAdmin: "SUPER_ADMIN",
      admin: "ADMIN",
      projectLead: "PROJECT_LEAD",
      teamLead: "TEAM_LEAD",
      employee: "EMPLOYEE",
  })

const getTeams = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  let filter = {};
  if (role === Role.admin || role === Role.superAdmin || role === Role.projectLead) {
    filter = { deletedAt: null };
  } else if (role === Role.teamLead) {
    filter = { teamLeader: _id, deletedAt: null };
  } else if (role === Role.employee) {
    filter = { members: _id, deletedAt: null };
  } else {
    return res.status(403).json({ message: "Access denied" });
  }

  const team = await Team.find(filter).populate("members", "name")
    .populate("teamLeader", "name")
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .populate("deletedBy", "name").lean();

  res.status(200).json({ message: "Get All Teams", teams: team });
});


const getTeamsLog = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  let filter = {};

  if (role === Role.admin || role === Role.superAdmin || role === Role.projectLead) {
    filter = {};
  } else if (role === Role.teamLead) {
    filter = { teamLeader: _id };
  } else if (role === Role.employee) {
    filter = { members: _id };
  } else {
    return res.status(403).json({ message: "Access denied" });
  }

  const team = await Team.find(filter).populate("members", "name")
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .populate("deletedBy", "name").lean();

  res.status(200).json({ message: "Get All Teams Log", team });
});


const getTeamsDelete = asyncHandler(async (req, res) => {
  const team = await Team.find({ deletedAt: { $ne: null } }).lean();
  res.status(200).json({ message: "Get All Teams", team });
});

const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    res.status(400);
    throw new Error("team not found");
  }
  res.status(200).json({ message: `update Teams ${req.params.id}`, team });
});

const setTeams = asyncHandler(async (req, res) => {
  try {
    const { teamName, teamDescription } = req.body;

    if (!teamName || !teamDescription) {
      res.status(400);
      throw new Error("Please provide both team name and description.");
    }

    // Check if team with same name was soft-deleted earlier
    const existing = await Team.findOne({
      teamName,
      deletedAt: { $ne: null },
    });

    let team;
    if (existing) {
      // Restore soft-deleted team
      team = await Team.findOneAndUpdate(
        { teamName },
        {
          $unset: { deletedAt: "" },
          updatedBy: req.user._id,
        },
        { new: true }
      );
    } else {
      // Create new team
      team = await Team.create({
        teamName,
        teamDescription,
        // teamLeader: req.user._id,       // automatically set current user as leader
        createdBy: req.user._id,
        members: [],                    // start with empty members array
      });
    }
    
    await createLog(
  `Team "${team.teamName}" was created`,
  req.user._id,
  "TEAM"
);
    res.status(201).json(team);
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
});

module.exports = { setTeams };

const updateTeams = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) {
    res.status(400);
    throw new Error("Team not found");
  }

  const update = {
    ...req.body,
    updatedBy: req.user._id,
  };

  const UpdatedTeam = await Team.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  // Create log after successful update
  await createLog(
    `Team "${UpdatedTeam.teamName}" was updated`,
    req.user._id,
    "TEAM"
  );

  res.status(200).json({
    message: `Updated team ${req.params.id}`,
    UpdatedTeam,
  });
});


const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const team = await Team.findById(id);
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Soft delete the team
  team.deletedAt = new Date();
  team.deletedBy = req.user._id;
  await team.save();

  // Clear `team` field of all members
  await User.updateMany(
    { _id: { $in: team.members } },
    { $unset: { team: "" } }
  );

  // Log the deletion
  await createLog(
    `Team "${team.teamName}" was deleted`,
    req.user._id,
    "TEAM"
  );

  res.json({ message: "Team deleted and members unassigned." });
});



const deleteAllTeams = asyncHandler(async (req, res) => {
  await Team.deleteMany({ deletedAt: { $ne: null } });
  res.status(200).json({ message: "Delete All Teams" });
});

// restore Team
const restoreTeam = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndUpdate(
    req.params.id,
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    },
    { new: true }
  );
  res.status(200).json({ message: `restore Team ${req.params.id}`, team });
});

// Restore All the Teams
const AllRestoreTeam = asyncHandler(async (req, res) => {
  const team = await Team.updateMany(
    { deletedAt: { $ne: null } },
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    },
    { new: true }
  );
  res.status(200).json({ message: "Restore All Teams", team });
});

const getAllTeamsPublic = async (req, res) => {
  try {
    const teamList = await Team.find({ deletedAt: null })
      .select("teamName teamLeader members teamDescription")
      .populate("teamLeader", "name")
      .populate("members", "name");

    res.status(200).json({ team: teamList });
  } catch (error) {
    console.error("Error fetching public teams:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const getTeamById = asyncHandler(async (req, res) => {
  const teamId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(teamId)) {
    return res.status(400).json({ message: "Invalid team ID" });
  }

  const team = await Team.findById(teamId)
    .populate("teamLeader", "name email")
    .populate("members", "name email")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email"); 

  if (!team || team.deletedAt) {
    return res.status(404).json({ message: "Team not found or has been deleted" });
  }

  res.status(200).json({ team });
});

const addMembersToTeam = asyncHandler(async (req, res) => {
  const { members } = req.body;
  const teamId = req.params.id;

  if (!Array.isArray(members) || members.length === 0) {
    res.status(400);
    throw new Error("Members must be a non-empty array.");
  }

  // Update team
  const team = await Team.findByIdAndUpdate(
    teamId,
    { $addToSet: { members: { $each: members } } },
    { new: true }
  );

  // Update users
  await User.updateMany(
    { _id: { $in: members } },
    { $set: { team: teamId } }
  );

  // Fetch the added members' names for logging
  const addedUsers = await User.find({ _id: { $in: members } }).select("name");

  // Create log entries for each added member
  for (const user of addedUsers) {
    await createLog(
      `User "${user.name}" was added to team "${team.teamName}"`,
      req.user._id,
      "TEAM"
    );
  }

  res.status(200).json(team);
});



const changeTeamLead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newLeadId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(newLeadId)) {
    return res.status(400).json({ message: "Invalid team lead ID" });
  }

  const team = await Team.findById(id);
  if (!team) {
    return res.status(404).json({ message: "Team not found" });
  }

  // Fetch new lead's details for logging
  const newLead = await User.findById(newLeadId).select("name");

  team.teamLeader = newLeadId;
  team.updatedBy = req.user._id;
  await team.save();

  // Log the change
  await createLog(
    `User "${newLead?.name || "Unknown"}" was assigned as team lead of "${team.teamName}"`,
    req.user._id,
    "TEAM"
  );

  res.status(200).json({ message: "Team lead updated", team });
});


// Get Team Lead by Team ID
const getTeamLead = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id).populate("teamLeader", "name email");
    if (!team || !team.teamLeader) {
      return res.status(404).json({ message: "Team or team lead not found" });
    }

    // ✅ Return only the team lead (cleaner, safer, easier to handle in frontend)
    return res.status(200).json({ teamLead: team.teamLeader });
  } catch (error) {
    console.error("Error fetching team lead:", error);
    return res.status(500).json({ message: "Server error while fetching team lead" });
  }
};



const removeMemberFromTeam = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { memberId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return res.status(400).json({ message: "Invalid member ID" });
  }

  // Remove member from team
  const team = await Team.findByIdAndUpdate(
    id,
    { $pull: { members: memberId } },
    { new: true }
  );

  // Update the user's team field
  const removedUser = await User.findByIdAndUpdate(
    memberId,
    { $unset: { team: "" } },
    { new: true }
  ).select("name");

  // Log the removal
  await createLog(
    `User "${removedUser?.name || "Unknown"}" was removed from team "${team?.teamName || "Unknown"}"`,
    req.user._id,
    "TEAM"
  );

  res.status(200).json({ message: "Member removed from team", team });
});

// controllers/teamController.js
const getAllTeamStatuses = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("teamLeader", "name email role")
      .populate("members", "name email role");

    const response = teams.map(team => ({
      teamId: team._id,
      teamName: team.teamName,
      status: team.status,
      teamLeader: team.teamLeader,
      members: team.members,
      stats: {
        totalMembers: team.members.length,
        activeMembers: team.members.filter(m => m.status === 1).length
      }
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching teams:", error);
    return res.status(500).json({ message: "Server error while fetching teams" });
  }
};

const getTeamByLead = asyncHandler(async (req, res) => {
  const { leadId } = req.params;

  const team = await Team.findOne({ teamLeader: leadId, deletedAt: null })
    .populate("teamLeader", "name email ")
    .populate("members", "name email role");

  if (!team) {
    res.status(404);
    throw new Error("Team not found for this lead");
  }

  // fetch tasks for each member
  const membersWithTasks = await Promise.all(
    team.members.map(async (member) => {
      const tasks = await Task.find({ assignedTo: member._id, deletedAt: null });
      const statusCounts = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {});
      return { ...member.toObject(), tasks: statusCounts };
    })
  );

  res.json({ ...team.toObject(), members: membersWithTasks });
});


module.exports = {
  getTeams,
  getTeam,
  AllRestoreTeam,
  getTeamsLog,
  restoreTeam,
  getTeamsDelete,
  setTeams,
  updateTeams,
  deleteTeam,
  deleteAllTeams,
  getAllTeamsPublic,
  getTeamById,
  addMembersToTeam,
  removeMemberFromTeam,
  changeTeamLead,
  getTeamLead,
  getAllTeamStatuses,
  getTeamByLead,
};
