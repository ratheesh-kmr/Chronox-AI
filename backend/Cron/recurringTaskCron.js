const cron = require("node-cron");
const Task = require("../models/taskModel");

// Function to mark tasks as Overdue
function setupOverdueTaskJob() {
  cron.schedule("20 12 * * *", async () => {
    try {
      const tasksToUpdate = await Task.find({
        status: { $nin: ["Completed", "OverDue"] },
        taskEndDate: { $lt: new Date() },
      });

      for (const task of tasksToUpdate) {
        task.status = "OverDue";
        await task.save();
      }

      console.log(`[CRON] Marked ${tasksToUpdate.length} tasks as Overdue`);
    } catch (err) {
      console.error("[CRON] Error marking tasks overdue:", err.message);
    }
  });
}

// Function to handle recurring task generation
function setupRecurringTaskJob() {
  cron.schedule("0 0 * * *", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ Skip Sundays
    if (today.getDay() === 0) {
      console.log("[CRON] Skipping recurring tasks on Sunday");
      return;
    }

    try {
      const recurringTasks = await Task.find({
        "recurrence.type": { $ne: "None" },
        recurrenceDates: { $elemMatch: { $eq: today } },
      });

      for (const originalTask of recurringTasks) {
        const alreadyExists = await Task.findOne({
          taskList: originalTask.taskList,
          assignedTo: { $in: originalTask.assignedTo },
          taskStartDate: today,
          recurrence: { $exists: false },
        });

        if (alreadyExists) continue;

        const newTask = new Task({
          ...originalTask.toObject(),
          _id: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          recurrence: { type: "None" },
          recurrenceDates: [],
          taskStartDate: today,
          taskEndDate: today, // You may want to adjust to proper duration
          status: "ToDo"
        });

        await newTask.save();
        console.log(`[CRON] Recurring task created: ${newTask.taskList}`);
      }
    } catch (error) {
      console.error("Error in recurring task cron job:", error);
    }
  });
}

module.exports = {
  setupRecurringTaskJob,
  setupOverdueTaskJob,
};
