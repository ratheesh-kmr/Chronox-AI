  const mongoose = require("mongoose");

  const projectSchema = mongoose.Schema(
    {
      projectName: {
        type: String,
        required: [true, "Please add a project name"],
        trim: true,
      },
      description: {
        type: String,
        default: "",
        trim: true,
      },
      teams: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Team",
        },
      ],
      members: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      projectStartDate: {
        type: Date,
      },
      projectDeliveryDate: {
        type: Date,
      },
      projectDuration: {
        type: String,
      },
      status: {
        type: String,
        enum: {
          values: ["Upcoming", "Active", "Completed","Delayed"],
          message: "{VALUE} is not a valid status",
        },
        default: "Upcoming",
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      deletedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

  const Project = mongoose.model("Project", projectSchema);
  module.exports = Project;
