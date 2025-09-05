
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String }, // e.g., 'CREATE', 'UPDATE', 'DELETE'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model("Log", logSchema);
