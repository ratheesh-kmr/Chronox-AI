const express = require("express");
const { chatWithAssistant } = require("../controllers/assistantController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/chat" , authMiddleware , chatWithAssistant);

module.exports = router;
