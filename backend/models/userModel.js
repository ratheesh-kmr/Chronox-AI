const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a text value"],
    },
    email: {
      type: String,
      unique: true,
    },
    mobileNo: {
      type: String,
    },
    date: {
      type: Date,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "team",
    },
    role: {
    type: String,
    enum: ['SUPER_ADMIN', 'ADMIN', 'PROJECT_LEAD', 'TEAM_LEAD', 'EMPLOYEE'],
    required: true
  },

    password: {
      type: String,
      required: [true, "Please add a text value"],
    },
    status: {
      type: Number,
      enum: [0, 1, 2],
      default: 0,
    },
    otp: {
      type: String,
    },
    otpExpireTime: {
      type: Date,
    },
    
    isOtpVerified: { 
      type: Boolean,
    },

    pendingMobile: { 
      type: String,
    },
    
    pendingEmail: { 
      type: String,
    },

    deletedAt:{
        type:Date
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
