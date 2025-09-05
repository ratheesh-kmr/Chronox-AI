const mongoose = require("mongoose");

const projectTeamSchema = mongoose.Schema(
  {
    projectDepartment: {
      type: String,
    },
    projectName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
    },
    projectStartDate: {
      type: Date,
    },
    projectDeliveryDate: {
      type: Date,
    },
    projectDuration: {
      type: String,
    },
    teamName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "team",
      },
    ],
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("projectTeam", projectTeamSchema);
