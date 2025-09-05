// analyticsController.js
const Task = require("../models/taskModel");
const Project = require("../models/projectModel");
const mongoose = require("mongoose");

exports.getProjectTaskCompletionAnalytics = async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }

  try {
    const data = await Task.aggregate([
      {
        $match: {
          projectName: new mongoose.Types.ObjectId(projectId),
          status: "Completed"
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" }
          },
          completedCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const formatted = data.map(d => ({
      date: d._id,
      completed: d.completedCount
    }));

    res.status(200).json({ analytics: formatted });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};
