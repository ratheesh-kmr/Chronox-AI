const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
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
      // required: true,
    },
    status: {
      type: String,
      enum: ["ToDo", "InProgress", "Completed","OverDue","Upcoming"],
      // required: true,
    },
    teamLeader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
   assignedTo: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
],
    recurrence: {
      type: {
        type: String,
        enum: ["None", "Daily", "Weekly", "Monthly", "Yearly"],
        // required: true,
      },
      repeatCount: {
        type: Number,
        default: 0,
      },
      startDate: {
        type: Date,
      },
    },
    recurrenceDates: [Date],
    subTask: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubTask",
      },
    ],

    extensionRequest: {
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  requestedEndDate: { type: Date },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: null },
  requestedAt: { type: Date }
},


    // label: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Label",
    //   },
    // ],
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

module.exports = mongoose.model("task", taskSchema);
