const Milestone = require("../models/milestoneModel");
const task = require("../models/taskModel");
const Project = require("../models/projectModel")
const asyncHandler = require("express-async-handler");

// Create a milestone
const createMilestone = asyncHandler(async (req, res) => {
  const { name, startDate, endDate, project, task } = req.body;

  const milestone = await Milestone.create({
    name,
    startDate,
    endDate,
    project,
    task,
    status: "In Progress",
  });

  await updateMilestoneStatus(milestone._id); // auto status update
  res.status(201).json({ message: "Milestone created", milestone });
});

// Fetch milestones by project
const getMilestonesByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const milestones = await Milestone.find({ project: projectId , deletedAt: null})
    .populate({ path: "task",
       select: "taskList status taskEndDate assignedTo" , 
       populate:{ path: "assignedTo", select: "name email"}})
    .sort({ createdAt: -1 });
  res.json({ milestones });
});

// Update milestone status based on task completion
const updateMilestoneStatus = async (milestoneId) => {
  const milestone = await Milestone.findById(milestoneId).populate("task", "status");
  if (!milestone) return;

  const allCompleted = milestone.task.length > 0 && milestone.task.every((task) => task.status === "Completed");

  milestone.status = allCompleted ? "Completed" : "In Progress";
  await milestone.save();
};

// Recalculate milestones that reference a given task
const updateMilestonesContainingTask = async (taskId) => {
  const milestones = await Milestone.find({ task: taskId });
  for (const ms of milestones) {
    await updateMilestoneStatus(ms._id);
  }
};

// Update milestone
const updateMilestone = asyncHandler(async (req, res) => {
  const { name, startDate, endDate, task } = req.body;
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) {
    res.status(404);
    throw new Error("Milestone not found");
  }

  if (typeof name !== "undefined") milestone.name = name;
  if (typeof startDate !== "undefined") milestone.startDate = startDate;
  if (typeof endDate !== "undefined") milestone.endDate = endDate;
  if (typeof task !== "undefined") milestone.task = task;

  await milestone.save();
  await updateMilestoneStatus(milestone._id);

  res.json({ message: "Milestone updated", milestone });
});

// Delete milestone
const deleteMilestone = asyncHandler(async (req, res) => {
  const milestone = await Milestone.findById(req.params.id);
  if (!milestone) {
    res.status(404);
    throw new Error("Milestone not found");
  }

  await milestone.deleteOne();
  res.json({ message: "Milestone deleted" });
});

module.exports = {
  createMilestone,
  getMilestonesByProject,
  updateMilestonesContainingTask,
  updateMilestone,
  deleteMilestone,
};
