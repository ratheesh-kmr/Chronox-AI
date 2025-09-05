const asyncHandler = require("express-async-handler");
const Project = require("../models/projectModel");
const createLog = require("../utils/createLog");
const Notification = require("../models/notificationModel")
const User = require("../models/userModel")

const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ deletedAt: null })
    .populate("teams", "teamName")
    .populate("members", "name")
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .populate("deletedBy", "name")
    .lean();

  res.status(200).json({ message: "Get All Projects", project: projects });
});


const getProjectsLog = asyncHandler(async (req, res) => {
  const project = await Project.find()
    .populate("teams", "teamName")
    .populate("members", "name")
    .populate("createdBy", "name")
    .populate("updatedBy", "name")
    .populate("deletedBy", "name");
  res.status(200).json({ message: "Get All Projects", project });
});

const getProjectsDelete = asyncHandler(async (req, res) => {
  const project = await Project.find({ deletedAt: { $ne: null } })
    .populate("teams", "teamName")
    .populate("members", "name");
  res.status(200).json({ message: "Get All Projects", project });
});

// const getProject = asyncHandler(async (req, res) => {
//   const project = await Project.findById(req.params.id);
//   if (!project) {
//     res.status(400);
//     throw new Error("project not found");
//   }

//   res.status(200).json({ message: `update Projects ${req.params.id}`, project });
// });

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("teams", "teamName")
    .populate("members", "name role " )
    .lean();

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

   res.status(200).json({ message: `Fetched project ${req.params.id}`, project });
});



const setProjects = asyncHandler(async (req, res) => {
  const {
    projectName,
    teams,
    members,
    description,
    projectStartDate,
    projectDeliveryDate,
    projectDuration,
    status,
  } = req.body;

  console.log("Incoming project body:", req.body);

  if (!projectName || !teams || !members || !description) {
    res.status(400);
    throw new Error("Please provide all required fields.");
  }

  const existing = await Project.findOne({
    projectName,
    deletedAt: { $ne: null },
  });

  let project;
  if (existing) {
    project = await Project.findByIdAndUpdate(
      existing._id,
      {
        $unset: { deletedAt: "" },
        $set: { updatedBy: req.user._id },
      },
      {
        new: true,
      }
    );
  } else {
    project = await Project.create({
      projectName,
      teams,
      members,
      description,
      projectStartDate,
      projectDeliveryDate,
      projectDuration,
      status,
      createdBy: req.user._id,
      updatedBy: req.user._id,  
    });
  }
await createLog(
  `Project "${project.projectName}" was created`,
  req.user._id,   
  "PROJECT"       
);

 const extraUsers = await User.find({
    role: { $in: ["PROJECT_LEAD", "ADMIN", "SUPER_ADMIN"] }
  }).select("_id");


  const recipients = [
    ...new Set([
      ...members.map(m => m.toString()),  
      ...extraUsers.map(u => u._id.toString())
    ])
  ];

  
  const notifications = recipients.map(userId => ({
    user: userId,
    title:"Project Creation",
    message: `Project "${project.projectName}" has been created.`,
    link: `/ProjectPage/${project._id}`,
    type: "PROJECT",
    read: false,
  }));

  await Notification.insertMany(notifications);

  
  if (req.io) {
    recipients.forEach(userId => {
      req.io.to(userId).emit("new_notification", {
        title:"Project Creation",
        message: `Project "${project.projectName}" has been created.`,
        link: `/ProjectPage/${project._id}`,
        type: "PROJECT",
        read: false,
        timestamp: new Date(),
      });
    });
  }

  res.status(200).json({ message: "Set Projects", project });
});

const updateProjects = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(400);
    throw new Error("project not found");
  }

  const updatedProjectData = {
    ...req.body,
    updatedBy: req.user._id,
  };

  const UpdatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    updatedProjectData,
    { new: true }
  );

  await createLog(
    `Project "${UpdatedProject.projectName}" was updated`,
    req.user._id,
    "PROJECT"
  );

  // Get role users
  const roleUsers = await User.find({
    role: { $in: ["PROJECT_LEAD", "ADMIN", "SUPER_ADMIN"] }
  }).select("_id");

  console.log("Members:", UpdatedProject.members);
  console.log("Role users:", roleUsers);

  const memberIds = Array.isArray(UpdatedProject.members)
    ? UpdatedProject.members
    : [];

  const allRecipientIds = [
    ...new Set([
      ...memberIds.map(id => id.toString()),
      ...roleUsers.map(u => u._id.toString())
    ])
  ];

  console.log("All recipients:", allRecipientIds);

  if (allRecipientIds.length > 0) {
  const notifications = allRecipientIds.map(userId => ({
    user: userId,
    title: "Project update", // ✅ Add title
    message: `Project "${UpdatedProject.projectName}" has been updated.`,
    link: `/ProjectPage/${UpdatedProject._id}`,
    type: "PROJECT",
    read: false
  }));

  try {
    const inserted = await Notification.insertMany(notifications, { ordered: false });
    console.log("Notifications actually inserted:", inserted.length);

    // Send real-time notifications
    inserted.forEach(notification => {
      req.io.to(notification.user.toString()).emit("new_notification", notification);
    });
  } catch (err) {
    console.error("Failed to create notifications:", err);
  }
}
  res.status(200).json({
    message: `Updated Project ${req.params.id}`,
    UpdatedProject
  });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(400);
    throw new Error("Project not found");
  }

  // Case 1: Already soft deleted -> permanently delete
  if (project.deletedAt) {
    await Project.findByIdAndDelete(project._id);
    return res.status(200).json({
      message: `Permanently deleted project ${req.params.id}`,
      project,
    });
  }

  
  project.deletedAt = Date.now();
  project.deletedBy = req.user._id;
  await project.save();

  
  const roleUsers = await User.find({
    role: { $in: ["PROJECT_LEAD", "ADMIN", "SUPER_ADMIN"] }
  }).select("_id");

  console.log("Members:", project.members);
  console.log("Role users:", roleUsers);

  
  const memberIds = Array.isArray(project.members) ? project.members : [];
  const allRecipientIds = [
    ...new Set([
      ...memberIds.map(id => id.toString()),
      ...roleUsers.map(u => u._id.toString())
    ])
  ];

  console.log("All recipients:", allRecipientIds);

  if (allRecipientIds.length > 0) {
    const notifications = allRecipientIds.map(userId => ({
      user: userId,
      title: "Project Deletion",
      message: `Project "${project.projectName}" has been deleted.`,
      link: `/ProjectPage/${project._id}`,
      type: "PROJECT",
      read: false
    }));

    try {
      const inserted = await Notification.insertMany(notifications, { ordered: false });
      console.log("Notifications actually inserted:", inserted.length);

      // Real-time send
      inserted.forEach(notification => {
        req.io.to(notification.user.toString()).emit("new_notification", notification);
      });
    } catch (err) {
      console.error("Failed to create notifications:", err);
    }
  }

  // Create log
  await createLog(
    `Project "${project.projectName}" was deleted`,
    req.user._id,
    "PROJECT"
  );

  res.status(200).json({ message: `deleteProjects ${req.params.id}`, project });
});


const deleteAllProjects = asyncHandler(async (req, res) => {
  await Project.deleteMany({ deletedAt: { $ne: null } });
  res.status(200).json({ message: "Delete All Projects" });
});

const restoreProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(
    req.params.id,
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    },
    {
      new: true,
    }
  );
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.status(200).json({
    message: `Restored project ${req.params.id}`,
    project,
  });
});

const AllRestoreProject = asyncHandler(async (req, res) => {
  const project = await Project.updateMany(
    { deletedAt: { $ne: null } },
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    },
    {
      new: true,
    }
  );
  res.status(200).json({ message: "Restore All Projects", project });
});

const getProjectsByUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const projects = await Project.find({
    members: userId,
    deletedAt: null,
  });

  res.status(200).json({ projects });
});

const getActiveProjects = asyncHandler(async (req, res) => {
  const activeProjects = await Project.find({ status: "Active" });

  res.status(200).json({
    count: activeProjects.length,
    projects: activeProjects
  });
});


module.exports = {
  getProjects,
  getProject,
  getProjectsByUser,
  AllRestoreProject,
  restoreProject,
  setProjects,
  updateProjects,
  deleteProject,
  getProjectsDelete,
  getProjectsLog,
  deleteAllProjects,
  getActiveProjects,
  
};
