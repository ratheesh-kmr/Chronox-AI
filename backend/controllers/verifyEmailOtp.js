const crypto = require("crypto");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { newEmail, otp } = req.body;

  if (!otp || !newEmail) {
    return res.status(400).json({ message: "OTP and new email are required" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Hash the OTP to compare with stored value
  const hashOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (user.otp !== hashOtp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  if (Date.now() > user.otpExpireTime) {
    return res.status(401).json({ message: "OTP has expired" });
  }

  // Update email
  user.email = newEmail;
  user.pendingEmail = null;
  user.otp = null;
  user.otpExpireTime = null;
  user.isOtpVerified = true;

  await user.save();

  res.status(200).json({ message: "Email updated successfully", email: user.email });
});

module.exports = { verifyEmailOtp };
