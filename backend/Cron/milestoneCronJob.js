const cron = require("node-cron");
const Milestone = require("../models/milestoneModel");
const Task = require("../models/taskModel");

function setupMilestoneStatusJob() {
  // Runs daily at 11:45 PM
  cron.schedule("0 */2 * * *", async () => {
    console.log("[CRON] Checking milestones for status update...");

    try {
      const allMilestones = await Milestone.find().populate("task");

      for (const milestone of allMilestones) {
        const allTasks = milestone.task;

        const allCompleted = allTasks.length > 0 && allTasks.every((t) => t.status === "Completed");
        const hasPending = allTasks.some((t) => t.status !== "Completed");
        const currentDate = new Date();
        const endDate = new Date(milestone.endDate);

        let updatedStatus = milestone.status;

        if (allCompleted) {
          updatedStatus = "Completed";
        } else if (endDate < currentDate && hasPending) {
          updatedStatus = "Delayed";
        } else {
          updatedStatus = "In Progress";
        }

        if (milestone.status !== updatedStatus) {
          milestone.status = updatedStatus;
          await milestone.save();
          console.log(`[CRON] Milestone "${milestone.name}" status updated to ${updatedStatus}`);
        }
      }
    } catch (error) {
      console.error("[CRON] Error updating milestone statuses:", error.message);
    }
  });
}

module.exports = {
  setupMilestoneStatusJob,
};
