const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Meeting title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Meeting date is required"],
    },
    link: {
      type: String,
      default: "",
    },

    mode: {
      type: String,
      default: "Online",
      enum: ["Offline", "Online"],
    },
    
    
    startTime: {
      type: String, // e.g., "14:00"
      required: [true, "Meeting start time is required"],
    },
    endTime: {
      type: String, // e.g., "15:30"
 
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);
