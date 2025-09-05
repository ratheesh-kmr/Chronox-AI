const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const dotenv = require("dotenv");
const Team = require("../models/teamModel");
const createLog = require("../utils/createLog");
dotenv.config();
const Notification = require("../models/notificationModel")



const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const STATUS = Object.freeze({
  Pending: 0,
  Approved: 1,
  Rejected: 2,
});

const Role = Object.freeze({
  superAdmin: "SUPER_ADMIN",
  admin: "ADMIN",
  projectLead: "PROJECT_LEAD",
  teamLead: "TEAM_LEAD",
  employee: "EMPLOYEE",
})

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, mobileNo, date, team, role, password } = req.body;

  if (!name || !email || !mobileNo || !date || !team || !role || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { mobileNo }] });
  if (userExists) {
    const errorMsg = userExists.email === email ? "Email Exist" : "Mobile Number Exist";
    return res.status(400).json({ message: errorMsg });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Validate team
  const existingTeam = await Team.findById(team);
  if (!existingTeam) {
    return res.status(404).json({ message: "Team not found" });
  }

  // Create user with status = 0 (pending approval)
  const user = await User.create({
    name,
    email,
    mobileNo,
    date,
    team,
    role,
    password: hashedPassword,
    status: 0 // PENDING
  });

  // Add to team members
  await Team.findByIdAndUpdate(team, { $addToSet: { members: user._id } });

  // Assign as team leader if required
  if (role === "TEAM_LEAD" && !existingTeam.teamLeader) {
    await Team.findByIdAndUpdate(team, { teamLeader: user._id });
  }

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
      date: user.date,
      team: user.team,
      role: user.role,
      token: generateToken(user._id),
    });

    /** --- Notification Section --- **/

    // 1. Get all admins and super admins
    const adminUsers = await User.find({
      role: { $in: ["ADMIN", "SUPER_ADMIN"] }
    }).select("_id");

    // 2. Create notification docs
    const notifications = adminUsers.map(admin => ({
      user: admin._id,
      title: "New User Registration",
      message: `New user "${user.name}" has registered and is awaiting approval.`,
      link: `/PendingApprovalPage`, 
      type: "USER_APPROVAL",
      read: false,
    }));

    // 3. Save notifications
    const inserted = await Notification.insertMany(notifications);

    // 4. Emit via Socket.IO (if real-time)
    if (req.io) {
      inserted.forEach(notification => {
        req.io.to(notification.user.toString()).emit("new_notification", notification);
      });
    }

     await createLog(`User "${user.name}" was approved`, req.user._id, "USER");
     
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});


const registerApprovedUser = asyncHandler(async (req, res) => {
  const { name, email, mobileNo, date, team, role, password } = req.body;

  if (!name || !email || !mobileNo || !date || !team || !role || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user already exists
  const userExists = await User.findOne({ $or: [{ email }, { mobileNo }] });
  if (userExists) {
    const errorMsg = userExists.email === email ? "Email Exist" : "Mobile Number Exist";
    return res.status(400).json({ message: errorMsg });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Ensure team exists
  const existingTeam = await Team.findById(team);
  if (!existingTeam) {
    return res.status(404).json({ message: "Team not found" });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    mobileNo,
    date,
    team,
    role,
    status: STATUS.Approved,
    createdBy: req.user._id,
    password: hashedPassword,
  });

  // Post-creation logic
  if (user) {
    // Add user to team members
    await Team.findByIdAndUpdate(team, { $addToSet: { members: user._id } });

    // Assign as team leader if applicable
    if (role === "TEAM_LEAD" && !existingTeam.teamLeader) {
      await Team.findByIdAndUpdate(team, { teamLeader: user._id });
    }

    // Return response
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
      date: user.date,
      team: user.team,
      role: user.role,
      token: generateToken(user._id, user.role),
    });

    // Optional: Notify managers via Socket.IO
    try {
      const io = req.app.get("io");
      if (io) {
        const notification = {
          type: "approved",
          userId: user._id,
          name: user.name,
          role: user.role,
          mobileNo: user.mobileNo,
          date: user.date,
          team: user.team,
          email: user.email,
          updatedAt: user.updatedAt,
        };
        io.to("managers").emit("userUpdatedStatus", notification);
      }
    } catch (err) {
      console.warn("Socket.IO notification failed:", err.message);
    }

  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});



const Approve = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.status = STATUS.Approved;
  await user.save();

  //  const transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       user: process.env.EMAIL,
  //       pass: process.env.PASSWORD,
  //     },
  //   });
  
  //   const mailOptions = {
  //     from: `Task Management System <${process.env.EMAIL}>`,
  //     to: user.email,
  //     subject: "Login Request Approved Notification",
  //     html: `
  //       <p>Hello ${user.name},</p>
  //       <p>Your login request has been approved. You can now log in to the system.</p>
  //       <p>Best regards,<br>Xplore Intellects Pvt Ltd</p>
  //     `,
  //   };
  
  //   transporter.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       console.error("Error sending email:", error);
  //       return res.status(500).json({ message: "Failed to send email" });
  //     } else {
  //       console.log("Email sent: " + info.response);
  //       return res.status(200).json({ message: "Email sent successfully" });
  //     }
  //   });

  const io = req.app.get("io");

  const notification = {
    type: "approved",
    userId: user._id,
    name: user.name,
    updatedAt: user.updatedAt,
    role: user.role,
    email: user.email,
    updatedAt:user.updatedAt
  };
  io.to("managers").emit("userUpdatedStatus", notification);
  await createLog(`User "${user.name}" was approved`, req.user._id, "USER");
  res.status(200).json({ message: `Approved user ${req.params.id}`, user });
});

const Reject = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  user.status = STATUS.Rejected;
  await user.save();

  await createLog(`User "${user.name}" was rejected`, req.user._id, "USER");
  res.status(200).json({ message: `Rejected user ${req.params.id}`, user });
});

const getPendingUsers = asyncHandler(async (req, res) => {
  const pendingUsers = await User.find({ status: STATUS.Pending });

  res.status(200).json({
    message: "Get All Users",
    pendingCount: pendingUsers.length,
    pendingUserList: pendingUsers,
  });
});

const getUser = asyncHandler(async (req, res) => {
  const users = await User.find({
    deletedAt: null,
    status: STATUS.Approved,
  });
  res.status(200).json({ message: "Get All Users", users });
});

const getUserLog = asyncHandler(async (req, res) => {
  const user = await User.find();
  res.status(200).json({ message: "Get All Users", user });
});

const getDeletedUser = asyncHandler(async (req, res) => {
  const user = await User.find({deletedAt: {$ne: null}});
  res.status(200).json({ message: `Deleted user`, user });
})

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    // If user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle user status cases
    if (user.status === STATUS.Rejected) {
      return res.status(403).json({ message: "User Rejected" });
    }

    if (user.status === STATUS.Pending) {
      return res.status(403).json({ message: "User Pending" });
    }

    // Check password only if user is approved
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Return response
    return res.status(200).json({
      token,
      role: user.role,
      username: user.name,
      userId: user._id,
      team: user.team,
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getLoggedInUser = asyncHandler(async (req, res) => {
  if (!req.user) {  
    res.status(401);
    throw new Error("Not authorized");
  }

  const { _id, name, email ,mobileNo , role} = req.user;
  res.status(200).json({
    id: _id,
    name,
    email,
    mobileNo,
    role,
  });
});


// GET /api/users/unassigned
const getUnassignedUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ team: null ,deletedAt: null});
  res.json(users); // Make sure this returns an array of user objects
});

const updatePassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Email Not Found" });
  }

  // Check OTP & expiry
  if (!user.otp || !user.otpExpireTime || user.otpExpireTime < Date.now()) {
    return res.status(400).json({ message: "OTP expired or invalid" });
  }

  // Hash and update password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  // Clear OTP fields
  user.otp = null;
  user.otpExpireTime = null;

  await user.save(); 

  res.status(200).json({
    message: "Password Updated Successfully",
    user,
  });
});


// update the user
const UpdateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  const UpdatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  UpdatedUser.password = UpdatedUser.password || "";
  UpdatedUser.updatedBy = req.user._id || "";
  await UpdatedUser.save();

  // Create log entry
const changes = Object.keys(req.body)
  .filter(key => user[key] !== req.body[key]) // Only keep changed fields
  .map(key => `${key}: "${user[key]}" → "${req.body[key]}"`)
  .join(", ");


if (changes) {
  await createLog(
    `User "${user.name}" updated: ${changes}`,
    req.user._id,
    "USER"
  );
}


  res
    .status(200)
    .json({ message: `update User ${req.params.id}`, UpdatedUser });
});


const restoreUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ message: "User restored", user });
});

// Restore all soft-deleted
const AllRestoreUser = asyncHandler(async (req, res) => {
  const user = await User.updateMany(
    { deletedAt: { $ne: null } },
    {
      $unset: { deletedAt: "" },
      $set: { updatedBy: req.user._id },
    },
    { new: true }
  );

  res.status(200).json({ message: "All employees restored", user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }
  
  user.deletedAt= Date.now();
  user.deletedBy = req.user._id;
  await user.save();
  res.status(200).json({ message: `Deleted user ${req.params.id}`, user });
});

const deleteAllUser = asyncHandler(async (req, res) => {
  await User.deleteMany({ deletedAt:{$ne: null}});
  res.status(200).json({ message: "Delete All User" });
});


const getSkillCount = asyncHandler(async (req, res) => {
  try {
    const skillCount = await User.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: "$team", count: { $sum: 1 } } },
      { $project: { team: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } } ,
    ]);

    res.status(200).json({ skillCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to count skills", error });
  }
});


exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const user = await User.findById(req.user._id);
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Current password is incorrect" });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message: "Password updated successfully" });
};

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // 1 = Approved, 2 = Rejected
  const userId = req.params.id;

  if (![1, 2].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If rejected, remove the user
  if (status === 2) {
    await User.findByIdAndDelete(userId);

    /** --- Optional: Send rejection email before deleting --- **/
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `Task Management System <${process.env.EMAIL}>`,
      to: user.email,
      subject: "Your Registration Has Been Rejected",
      html: `
        <div style="font-family: sans-serif; line-height: 1.5;">
          <h2>Hello ${user.name},</h2>
          <p>We regret to inform you that your registration has been rejected.</p>
          <p>Please contact our support team at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a> for more information.</p>
        </div>
      `,
    });

    // Log rejection
    await createLog(
      `User "${user.name}" was rejected and removed from the system`,
      req.user._id,
      "USER_APPROVAL"
    );

    return res.json({
      message: "User rejected and removed successfully",
    });
  }

  // If approved, update status
  user.status = 1;
  await user.save();

  /** --- In-app Notification --- **/
  const notification = await Notification.create({
    user: user._id,
    title: "Account Approved",
    message:
      "Your account has been approved. You can now view and manage your tasks.",
    link:
      user.requestedRole == "EMPLOYEE"
        ? "/EmployeeDashboard"
        : user.requestedRole == "TEAM_LEAD"
        ? "/TeamLeadDashboard"
        : "/dashboard",
    type: "USER_APPROVAL",
    read: false,
  });

  if (req.io) {
    req.io.to(user._id.toString()).emit("new_notification", notification);
  }

  /** --- Send approval email --- **/
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `Task Management System <${process.env.EMAIL}>`,
    to: user.email,
    subject: "Your Account Has Been Approved",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Congratulations, ${user.name}!</h2>
        <p>Your account has been approved. You can now log in and start using the platform.</p>
        <p><a href="${process.env.FRONTEND_URL}/login" style="color: blue;">Login Here</a></p>
      </div>
    `,
  });

  await createLog(
    `User "${user.name}" was approved`,
    req.user._id,
    "USER_APPROVAL"
  );

  res.json({
    message: "User approved successfully",
    user,
  });
});



module.exports = {
  registerUser,
  registerApprovedUser,
  loginUser,
  Approve,
  deleteUser,
  deleteAllUser,
  getSkillCount,
  AllRestoreUser,
  restoreUser,
  Reject,
  updatePassword,
  UpdateUserById,
  getDeletedUser,
  getLoggedInUser,
  getUser,
  getPendingUsers,
  getUserLog,
  getUnassignedUsers,
  updateUserStatus,
};
