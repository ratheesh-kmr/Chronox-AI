const Project = require("../models/projectModel");
const cron = require("node-cron");
const ProjectTeam = require("../models/projectTeamModel");
const userModel = require("../models/userModel");
const Task = require("../models/taskModel"); // Required for status check


function projectStatusChecker() { 
  cron.schedule("0 */2 * * *", async () => {                  //runs every 2 hours 
    console.log(" Project status check running...");

    try {
      const projects = await Project.find();

      for (const project of projects) {
        let updated = false;

        // Check delay
        if (new Date(project.endDate) < new Date() && project.status !== "Completed" && project.status !== "Delayed") {
          project.status = "Delayed";
          updated = true;
        }

        // Check completion
        const tasks = await Task.find({ project: project._id });
        const allCompleted = tasks.length > 0 && tasks.every(task => task.status === "Completed");

        if (allCompleted && project.status !== "Completed") {
          project.status = "Completed";
          updated = true;
        }

        if (updated) {
          await project.save();
          console.log(` Project "${project.projectName}" status updated to "${project.status}"`);
        }
      }

      console.log(" Project status check finished.");
    } catch (error) {
      console.error(" Error in project status checker cron job:", error);
    }
  });
}

module.exports = {
  projectStatusChecker,
};
