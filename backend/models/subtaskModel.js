const mongoose = require("mongoose");

const SubtaskSchema = mongoose.Schema(
  {
    projectName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    teams: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
    taskList: {
      type: String,
    },
    taskStartDate: {
      type: Date,
    },
    description: {
      type: String,
    },
    taskEndDate: {
      type: Date,
    },
    duration: {
      type: String,
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ToDo", "InProgress", "InReview", "Completed","Upcoming"],
      required: true,
    },
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    recurrence: {
      type: {
        type: String,
        enum: ["None", "Daily", "Weekly", "Monthly", "Yearly"],
        required: true,
      },
      repeatCount: {
        type: Number,
        default: 0,
      },
      startDate: {
        type: Date,
      },
    },
    recurrenceDate: [Date],
    label: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
      },
    ],
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

const SubTask = mongoose.model("SubTask", SubtaskSchema);

module.exports = SubTask;
