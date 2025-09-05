const express = require("express");
const {
  createMilestone,
  getMilestonesByProject,
  updateMilestone,
  deleteMilestone,
} = require("../controllers/milestoneController");

const router = express.Router();

router.post("/", createMilestone);
router.get("/project/:projectId", getMilestonesByProject);
router.put("/:id", updateMilestone);
router.delete("/:id", deleteMilestone);
    
module.exports = router;
