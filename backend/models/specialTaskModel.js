const mongoose = require("mongoose");

const subTaskSchema = new mongoose.Schema(
  {
    taskList: String,
    taskStartDate: Date,
    description: String,
    taskEndDate: Date,
    duration: String,
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
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

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
    recurrenceDates: [Date],
    label: [{ type: mongoose.Schema.Types.ObjectId, ref: "Label" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: Date,
  },
  {
    timestamps: true,
    _id: true,
  }
);

const specialSchema = mongoose.Schema(
  {
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
    recurrenceDates: [Date],
    subTask: [subTaskSchema],
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

const SpecialTask = mongoose.model("SpecialTask", specialSchema);

module.exports = SpecialTask;