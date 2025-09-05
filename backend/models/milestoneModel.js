const mongoose = require("mongoose");

const milestoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    task: [{ type: mongoose.Schema.Types.ObjectId, ref: "task" }],
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed","Delayed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Milestone", milestoneSchema);
