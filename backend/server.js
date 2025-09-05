require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectToDatabase = require("./config/db");
const User = require("./models/userModel");

const { projectStatusChecker } = require("./Cron/projectCron");
const { setupRecurringTaskJob, setupOverdueTaskJob } = require("./Cron/recurringTaskCron");
const { setupMilestoneStatusJob } = require("./Cron/milestoneCronJob");

const app = express();
const server = http.createServer(app);

// Connect DB
connectToDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io to req
const io = require("socket.io")(server, {
  cors: {
    origin: ["http://localhost:5173" ,"http://localhost:3000" , ], 
    credentials: true,
    methods: ["GET", "POST"],
  },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});


// Socket.IO authentication
io.use(async (socket, next) => {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.query.token ||
    socket.handshake.headers?.authorization?.split(" ")[1];

  if (!token) return next(new Error("Authentication missing token"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded.userId).select("-password");
    if (!user) return next(new Error("User not found"));

    socket.user = user;

    // Role-based rooms (uppercase convention)
    if (user.role === "ADMIN") socket.join("admins");
    else if (user.role === "TEAM_LEAD") socket.join("team_leads");
    else if (user.role === "EMPLOYEE") socket.join("employees");

    next();
  } catch (err) {
    console.error("Socket Auth Error:", err);
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.user.name} (${socket.user.role})`);
  socket.join(socket.user._id.toString()); // Private user room

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.user.name}`);
  });
});

// Cron jobs
setupRecurringTaskJob();
setupOverdueTaskJob();
setupMilestoneStatusJob();
projectStatusChecker();

// Routes
app.use("/api/label", require("./routes/labelRoutes"));
app.use("/api/project", require("./routes/projectRoutes"));
app.use("/api/task", require("./routes/taskRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/holiday", require("./routes/holidaysRoute"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/logs", require("./routes/logRoutes"));
app.use("/api/milestones", require("./routes/milestoneRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/assistant", require("./routes/assistantRoutes"));
app.use("/api/meetings", require("./routes/meetingRoutes"));
app.use("/api/teamLead",require("./routes/teamLeadRoutes"));


// Error handler last
app.use(errorHandler);

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
