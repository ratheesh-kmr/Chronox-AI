const asyncHandler = require("express-async-handler");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const SubTask = require("../models/subtaskModel");
const generateRecurrenceDates = require("./generateRecurrenceDate");
const Project = require("../models/projectModel");
const Team = require("../models/teamModel");
const createLog = require("../utils/createLog");
const Notification = require("../models/notificationModel");
const calculateWorkingDuration = require("../utils/calculateWorkingDuration");

const Role = Object.freeze({
  superAdmin: "SUPER_ADMIN",
  admin: "ADMIN",
  projectLead: "PROJECT_LEAD",
  teamLead: "TEAM_LEAD",
  employee: "EMPLOYEE",
});





// Get all tasks
const getTasks = asyncHandler(async (req, res) => {
  const { role, _id } = req.user;
  let filter = { deletedAt: null };

  if (role === Role.teamLead) {
    filter.teamLeader = _id;
  } else if (role === Role.employee) {
    filter.assignedTo = _id;
  } else if (![Role.superAdmin, Role.admin, Role.projectLead].includes(role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const task = await Task.find(filter)
    .populate("projectName", "projectName")
    .populate("assignedTo", "name")
    .populate("assignedBy", "name")
    .populate("teams", "teamName")
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .populate("deletedBy", "name")
    // .populate("label", "labelName color")
    .populate({
      path: "subTask",
      populate: { path: "assignedTo", select: "name" },
    });

  res.status(200).json({ message: "Get All Tasks", task });
});

// Get task logs
const getTasksLog = asyncHandler(async (req, res) => {
  return getTasks(req, res); // same logic as getTasks
});

// Get deleted tasks
const getTasksDelete = asyncHandler(async (req, res) => {
  const task = await Task.find({ deletedAt: { $ne: null } }).populate("teams", "teamName");
  res.status(200).json({ message: "Get Deleted Tasks", task });
});

// Get single task
const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("projectName", "projectName")
    .populate("assignedTo", "name")
    .populate("assignedBy", "name")
    .populate("teams", "teamName")
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .populate("deletedBy", "name")
    // .populate("label", "labelName color")
    .populate({
      path: "subTask",
      populate: { path: "assignedTo", select: "name" },
    });

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  res.status(200).json({ message: "Get Task", task });
});



const setTask = asyncHandler(async (req, res) => {
  let {
    projectName,
    teams,
    assignedBy,
    assignedTo,
    taskList,
    taskStartDate,
    priority,
    taskEndDate,
    // label = [],
    description,
    duration,
    status,
    teamLeader,
    recurrence = { type: "None", repeatCount: 0 },
    subTask = [],
  } = req.body;

  //   Validate required fields
  if (!taskList || !assignedTo || !taskStartDate || !priority || !status) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  //   Normalize assignedTo as array
  const assignedToArray = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

  //   Validate assigned users exist
  const users = await User.find({ _id: { $in: assignedToArray } });
  if (users.length !== assignedToArray.length) {
    res.status(400);
    throw new Error("One or more assigned users are invalid");
  }

  //   Validate and fetch project (if provided)
  if (projectName) {
    const project = await Project.findById(projectName);
    if (!project) {
      res.status(400);
      throw new Error("Project not found");
    }
  }

 
 // Team handling

if (teams) {
  // Case 1: Team explicitly provided
  const team = await Team.findById(teams).populate("teamLeader");
  if (!team) {
    res.status(400);
    throw new Error("Team not found");
  }

  // Auto-assign team leader if not provided
  if (!teamLeader && team.teamLeader) {
    teamLeader = team.teamLeader._id;
  }
}

else {
  // Case 2: No team provided (null/undefined/empty) → use first user's team
  const firstUser = await User.findById(assignedToArray[0]).populate("team");

  if (firstUser && firstUser.team) {
    teams = firstUser.team._id;

    // Auto-assign team leader if available
    const autoTeam = await Team.findById(teams).populate("teamLeader");
    if (autoTeam && autoTeam.teamLeader) {
      teamLeader = autoTeam.teamLeader._id;
    }
  } else {
    // Case 3: First user has no team → leave teams as null
    teams = "no team";
  }
}


  //   Generate recurrence dates
  const recurrenceDates = generateRecurrenceDates(recurrence);

  //   Insert subtasks and generate recurrence per subtask
  const createdSubTasks = await SubTask.insertMany(
    subTask.map((sub) => ({
      ...sub,
      createdBy: req.user._id,
      recurrenceDates: generateRecurrenceDates(sub.recurrence || { type: "None", repeatCount: 0 }),
    }))
  );
  const subTaskIds = createdSubTasks.map((s) => s._id);

  if (!duration || duration == null || duration === "") {
  duration = calculateWorkingDuration(taskStartDate, taskEndDate, true);
}

  //   Create the main task
  let task = await Task.create({
    projectName,
    teams,
    assignedBy,
    assignedTo: assignedToArray,
    description,
    taskList,
    taskStartDate,
    priority,
    // label,
    taskEndDate,
    duration,
    status,
    teamLeader,
    recurrence,
    recurrenceDates,
    subTask: subTaskIds,
    createdBy: req.user._id,
  });

  //Project status update logic
  if (projectName) {
    const proj = await Project.findById(projectName);

    if (proj) {
      let updated = false;

      // If project is marked COMPLETED
      

      // If task end date is beyond project end date, extend project
      if (new Date(taskEndDate) > new Date(proj.endDate)) {
        proj.endDate = new Date(taskEndDate);
        updated = true;
      }

      if (proj.status === "Completed") {
        proj.status = "Active";
        updated = true;
      }

      if (updated) await proj.save();
    }
  }



  //   Populate task details
  task = await Task.findById(task._id)
    .populate("projectName", "projectName")
    .populate("teams", "teamName")
    .populate("teamLeader", "name")
    .populate("assignedBy", "name")
    // .populate("label", "labelName color")
    .populate("assignedTo", "name")
    .populate("createdBy", "name")
    .populate({
      path: "subTask",
      populate: { path: "assignedTo", select: "name" },
    });

  //notification
  for (const userId of assignedToArray) {
    const notification = await Notification.create({
      user: userId,
      title: "New Task Assigned",
      message: `You have been assigned: ${task.taskList}`,
      type: "TASK",
      link: `/TaskDetailsPage/${task._id}`,
    });

    // Emit to each user's socket room
    req.io.to(userId.toString()).emit("new_notification", notification);
    console.log("Sending notification to:", assignedToArray);

  }

  await createLog(`Task "${task.taskList}" was created`, req.user._id, "TASK");
  res.status(200).json({ message: "Set Task", task });
});


// Update task status
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { taskId, status } = req.body;
  const validStatuses = ["ToDo", "InProgress", "OverDue", "Completed", "Upcoming"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const updatedTask = await Task.findByIdAndUpdate(
    taskId,
    { $set: { status, updatedBy: req.user._id } },
    { new: true }
  )
    .populate("updatedBy", "name")
    .populate("teams", "teamName");

  if (!updatedTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  await SubTask.updateMany(
    { _id: { $in: updatedTask.subTask } },
    { $set: { status, updatedBy: req.user._id } }
  );

  const notification = await Notification.create({
    user: Task.assignedTo,
    title: "Task status update",
    message: `The task  ${updatedTask.taskList} Status has been changed to : ${updatedTask.status} by ${req.user._id}`,
    type: "TASK",
    link: `/TaskDetailsPage/${Task._id}`,
  });

  // Send real-time notification
  req.io.to(Task.assignedTo.toString()).emit("new_notification", notification);


await createLog(
  `Task "${updatedTask.taskList}" was updated with status "${updatedTask.status}"`,
  req.user._id,
  "TASK"
);

  res.status(200).json({ message: "Task Updated Successfully", updatedTask });
});

// Update task
// const updateTask = asyncHandler(async (req, res) => {
//   const task = await Task.findById(req.params.id);
//   if (!task) {
//     res.status(404);
//     throw new Error("Task not found");
//   }

//   const { recurrence } = req.body;
//   const recurrenceDates = generateRecurrenceDates(recurrence);

//   const updatedTask = await Task.findByIdAndUpdate(
//     req.params.id,
//     { ...req.body, recurrenceDates, updatedBy: req.user._id },
//     { new: true }
//   )
//     .populate("updatedBy", "name")
//     .populate("teams", "teamName")
//     .populate("assignedTo", "name")
//     .populate("assignedBy", "name")
//     .populate("createdBy", "name");

//   const io = req.app.get("io");

//   const notification = {
//     type: "Edited",
//     taskId: updatedTask._id,
//     teams: updatedTask.teams?.teamName,
//     status: updatedTask.status,
//     updatedAt: updatedTask.updatedAt,
//     employee: updatedTask.assignedTo?.name ?? "Unknown",
//     taskList: updatedTask.taskList,
//     updatedBy: updatedTask.updatedBy?.name ?? "Unknown",p
//   };

//   io.to("managers").emit("taskEdited", notification);
//   io.to("teamLeader").emit("taskEdited", notification);

//   res.status(200).json({ message: "Updated Task", updatedTask });
// });

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  const recurrence = req.body.recurrence || { type: "None", repeatCount: 0 };
  const recurrenceDates = generateRecurrenceDates(recurrence);

  const update = {
    ...req.body,
    recurrenceDates,
    updatedBy: req.user._id,
  };

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  await createLog(
    `Task "${task.taskList}" was updated by user ${req.user.name || req.user._id} to the status "${task.status}" `,
    req.user._id,
    "TASK"
  );

  for (const userId of updatedTask.assignedTo) {
    // Notify assigned user
    const notifAssigned = await Notification.create({
      user: userId,
      title: "Task status update",
      message: `The task "${updatedTask.taskList}" status has been changed to: ${updatedTask.status} by ${req.user.name || req.user._id}`,
      type: "TASK",
      link: `/TaskDetailsPage/${updatedTask._id}`,
    });
    req.io.to(userId.toString()).emit("new_notification", notifAssigned);

    // Notify task creator (only if they are not the assigned user)
    if (userId.toString() !== updatedTask.createdBy.toString()) {
      const notifCreator = await Notification.create({
        user: updatedTask.createdBy,
        title: "Task status update",
        message: `The task "${updatedTask.taskList}" status has been changed to: ${updatedTask.status} by ${req.user.name || req.user._id}`,
        type: "TASK",
        link: `/TaskDetailsPage/${updatedTask._id}`,
      });
      req.io.to(updatedTask.createdBy.toString()).emit("new_notification", notifCreator);
    }
  }


  res.status(200).json({ message: `Updated Task ${req.params.id}`, updatedTask });
});


// Update subtask
const updateSubTask = asyncHandler(async (req, res) => {
  const task = await SubTask.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Subtask not found");
  }

  const { recurrence } = req.body;
  const recurrenceDates = generateRecurrenceDates(recurrence);

  const updatedTask = await SubTask.findByIdAndUpdate(
    req.params.id,
    { ...req.body, recurrenceDates, updatedBy: req.user._id },
    { new: true }
  )
    .populate("updatedBy", "name")
    .populate("teams", "teamName");

  res.status(200).json({ message: "Updated SubTask", updatedTask });
});

// Soft/Permanent delete task
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  if (task.deletedAt) {
    await Task.findByIdAndDelete(task._id);
    await SubTask.deleteMany({ _id: { $in: task.subTask } });
    await createLog(
      `Task "${task.taskList}" permanently deleted by user ${req.user.name || req.user._id}`,
      req.user._id,
      "TASK"
    );
    return res.status(200).json({ message: "Permanently deleted task", task });
  } else {
    task.deletedAt = Date.now();
    task.deletedBy = req.user._id;
    await task.save();
    await createLog(
      `Task "${task.taskList}" deleted by user ${req.user.name || req.user._id}`,
      req.user._id,
      "TASK"
    );
    res.status(200).json({ message: "Soft-deleted task", task });
  }
});

// Soft/Permanent delete subtask
const deleteSubTask = asyncHandler(async (req, res) => {
  const task = await SubTask.findById(req.params.id);
  if (!task) {
    res.status(404);
    throw new Error("SubTask not found");
  }

  if (task.deletedAt) {
    await SubTask.findByIdAndDelete(task._id);
    return res.status(200).json({ message: "Permanently deleted subtask", task });
  } else {
    task.deletedAt = Date.now();
    task.deletedBy = req.user._id;
    await task.save();
    res.status(200).json({ message: "Soft-deleted subtask", task });
  }
});

// Restore task
const restoreTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    },
    { new: true }
  );
  res.status(200).json({ message: "Task restored", task });
});

// Restore subtask
const restoreSubTask = asyncHandler(async (req, res) => {
  const task = await SubTask.findByIdAndUpdate(
    req.params.id,
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    },
    { new: true }
  );
  res.status(200).json({ message: "SubTask restored", task });
});

// Delete all soft-deleted tasks
const deleteAllTask = asyncHandler(async (req, res) => {
  await Task.deleteMany({ deletedAt: { $ne: null } });
  await SubTask.deleteMany({ deletedAt: { $ne: null } });
  res.status(200).json({ message: "All soft-deleted tasks permanently removed" });
});

// Restore all soft-deleted tasks
const AllRestoreTask = asyncHandler(async (req, res) => {
  const task = await Task.updateMany(
    { deletedAt: { $ne: null } },
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    }
  );
  await SubTask.updateMany(
    { deletedAt: { $ne: null } },
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    }
  );
  res.status(200).json({ message: "All tasks restored", task });
});

// Delete all soft-deleted subtasks
const deleteAllSubTask = asyncHandler(async (req, res) => {
  await SubTask.deleteMany({ deletedAt: { $ne: null } });
  res.status(200).json({ message: "All soft-deleted subtasks deleted" });
});

// Restore all soft-deleted subtasks
const AllRestoreSubTask = asyncHandler(async (req, res) => {
  const task = await SubTask.updateMany(
    { deletedAt: { $ne: null } },
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    }
  );
  res.status(200).json({ message: "All subtasks restored", task });
});

// Get subtasks for a given task ID
const getSubTasksByTaskId = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.findById(taskId).populate({
    path: "subTask",
    populate: { path: "assignedTo", select: "name" },
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.status(200).json({ message: "SubTasks fetched", subTasks: task.subTask });
});

const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("assignedTo", "name email role")
    .populate("teams", "name")
    .populate("project", "name description")
    .populate("createdBy", "name email");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  // Optional: add role-based access filtering
  if (
    req.user.role === "EMPLOYEE" &&
    !task.assignedTo.some((user) => user._id.equals(req.user._id))
  ) {
    res.status(403);
    throw new Error("Not authorized to view this task");
  }

  res.status(200).json({ task });
});

// Get tasks assigned to a user
const getTasksByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const tasks = await Task.find({
     assignedTo: { $in: [userId] },
      deletedBy: null
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error getting tasks by user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//get the tasks for the particular project
const getTasksByProject = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const task = await Task.find({ projectName: projectId, deletedBy: null })
    .populate("projectName", "name");
  res.status(200).json(task);
});


//get the pending tasks for the particular project
const getProjectPendingTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    res.status(400);
    throw new Error("Project ID is required");
  }

  const tasks = await Task.find({
    projectName: projectId,
    status: {
      $in: ["ToDo", "OverDue"],
      deletedBy: null
    },
  })
    .populate("assignedTo", "name")
    .populate("projectName", "projectName");

  res.status(200).json({ tasks });
});

const getUserNameById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("name username");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ name: user.name || user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Employee requests extension
const requestTaskExtension = asyncHandler(async (req, res) => {
  const { taskId, newEndDate } = req.body;

  const task = await Task.findById(taskId)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  //  Only assignee can request
  if (!task.assignedTo.map(u => u._id.toString()).includes(req.user._id.toString())) {
    res.status(403);
    throw new Error("Only assigned employees can request extension");
  }

  //  Save extension request
  task.extensionRequest = {
    requestedBy: req.user._id,
    requestedEndDate: newEndDate,
    status: "PENDING",
    requestedAt: new Date(),
  };

  await task.save();

  //  Notify the creator/assigner
 const notification = await Notification.create({
  user: task.createdBy._id,
  title: "Task Extension Requested",
  message: `${req.user.name} requested an extension for task "${task.taskList}" until ${new Date(newEndDate).toLocaleDateString()}.`,
  type: "TASK",
  link: task.createdBy.role == "TEAM_LEAD" 
    ? "/teamleadExtensionRequest" 
    : "/ExtensionRequestsPage",
});


  //  Real-time notification
  req.io.to(task.createdBy._id.toString()).emit("new_notification", notification);

  res.json({ message: "Extension request sent", task });
});



// Creator approves/rejects extension

const handleTaskExtensionRequest = asyncHandler(async (req, res) => {
  const { taskId, decision } = req.body; // decision = "APPROVED" or "REJECTED"

  const task = await Task.findById(taskId).populate("extensionRequest.requestedBy", "name email");

  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }

  //  Only task assigner can approve/reject
  if (String(task.createdBy) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Only task assigner can approve/reject extension");
  }

  if (!task.extensionRequest || task.extensionRequest.status !== "PENDING") {
    res.status(400);
    throw new Error("No pending extension request");
  }

  //  Update extension request
  task.extensionRequest.status = decision;

  if (decision === "APPROVED") {
    task.taskEndDate = task.extensionRequest.requestedEndDate;
    task.status = "InProgress";
  }

  await task.save();

  //  Notify the employee
  const notification = await Notification.create({
    user: task.extensionRequest.requestedBy._id,
    title: "Task Extension Request",
    message: `Your extension request for task "${task.taskList}" has been ${decision.toLowerCase()} by ${req.user.name}.`,
    type: "TASK",
    link: `/TaskDetailsPage/${task._id}`,
  });

  //  Real-time notification
  req.io.to(task.extensionRequest.requestedBy._id.toString()).emit("new_notification", notification);

  res.json({ message: `Extension ${decision}`, task });
});


const getExtensionRequests = asyncHandler(async (req, res) => {
  const tasks = await Task.find({
    "extensionRequest.status": "PENDING"
  })
    .populate("extensionRequest.requestedBy", "name email")
    .populate("createdBy", "name email");

  res.json(tasks);
});

const getExtensionRequestsByUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    res.status(400);
    throw new Error("User ID is required");
  }

  const tasks = await Task.find({
    "extensionRequest.status": "PENDING",
    createdBy: userId, 
  })
    .populate("extensionRequest.requestedBy", "name email")
    .populate("createdBy", "name email");

  res.status(200).json({
    success: true,
    count: tasks.length,
    tasks,
  });
});





module.exports = {
  getTasks,
  getTask,
  getTasksByUser,
  getTasksDelete,
  AllRestoreTask,
  restoreTask,
  setTask,
  getTasksLog,
  updateTask,
  deleteTask,
  deleteAllTask,
  updateSubTask,
  updateTaskStatus,
  deleteSubTask,
  deleteAllSubTask,
  restoreSubTask,
  AllRestoreSubTask,
  getSubTasksByTaskId,
  getTaskById,
  getProjectPendingTasks,
  getTasksByProject,
  getUserNameById,
  requestTaskExtension,
  handleTaskExtensionRequest,
  getExtensionRequests,
  getExtensionRequestsByUser,
};
