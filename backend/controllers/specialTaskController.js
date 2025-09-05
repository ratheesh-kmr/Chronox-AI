const asyncHandler = require("express-async-handler");
const SpecialTask = require("../models/specialTaskModel");
const generateRecurrenceDates = require("./generateRecurrenceDate");

const getTask = asyncHandler(async (req, res) => {
  const task = await SpecialTask.find({});
  res.status(200).json({ task });
});

const setTask = asyncHandler(async (req, res) => {
  const {
    taskList,
    taskStartDate,
    taskEndDate,
    description,
    duration,
    priority,
    status,
    assignedBy,
    assignedTo,
    recurrence,
    label,
    subTask = [],
  } = req.body;

  if (!taskList || !assignedTo || !taskStartDate) {
    res.status(400);
    throw new Error("Missing required fields");
  }
  const recurrenceDates = generateRecurrenceDates(recurrence);

  const enrichedSubTasks = subTask.map((sub) => ({
    ...sub,
    createdBy: req.user._id,
  }));

  const task = await SpecialTask.create({
    taskList,
    taskStartDate,
    taskEndDate,
    description,
    duration,
    priority,
    status,
    assignedBy,
    assignedTo,
    recurrence,
    recurrenceDates,
    subTask: enrichedSubTasks,
    label,
    createdBy: req.user._id,
  });

  res.status(201).json(task);
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await SpecialTask.findById(req.params.id);

  if (!task) {
    res.status(400);
    throw new Error("Task not found");
  }

  let { recurrence, subTask = [] } = req.body;

  const recurrenceDates = generateRecurrenceDates(recurrence);

  const enrichedSubTasks = subTask.map((sub) => ({
    ...sub,
    updatedBy: req.user._id,
  }));

  const update = {
    ...req.body,
    recurrence,
    recurrenceDates,
    subTask: enrichedSubTasks,
    updatedBy: req.user._id,
  };

  const updatedTask = await SpecialTask.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  );
  res
    .status(200)
    .json({ message: `Updated Task ${req.params.id}`, updatedTask });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await SpecialTask.findById(req.params.id);
  if (!task) {
    res.status(400);
    throw new Error("Task not found");
  }
  await SpecialTask.findByIdAndDelete(task._id);
  return res
    .status(200)
    .json({ message: `Permanently deleted task ${req.params.id}`, task });
});

const deleteAllTask = asyncHandler(async (req, res) => {
  await SpecialTask.deleteMany({ deletedAt: { $ne: null } });
  res.status(200).json({ message: "Delete All Task" });
});

module.exports = {
  getTask,
  setTask,
  updateTask,
  deleteTask,
  deleteAllTask,
};
