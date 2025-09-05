// utils/findTeamAndAssignLead.js
const Team = require("../models/teamModel");

const findTeamAndAssignLead = async (assignedUsers) => {
    if (!assignedUsers || assignedUsers.length === 0) {
        return { team: null, teamLeader: null };
    }

    // Extract user IDs
    const userIds = assignedUsers.map((u) => u._id);

    // Find the team where at least one of these users is a member
    const team = await Team.findOne({ members: { $in: userIds } }).populate("teamLeader");
    if (!team) {
        console.log("⚠️ No team found for users:", userIds);
        return { team: null, teamLeader: null };
    }

    return {
        team: team._id,
        teamLeader: team.teamLeader ? team.teamLeader._id : null,
    };
};

module.exports = findTeamAndAssignLead;
