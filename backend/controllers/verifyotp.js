const crypto = require("crypto");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const hashOtp = crypto.createHash("sha256").update(otp).digest("hex");

  if (user.otp !== hashOtp) {
    return res.status(401).json({ message: "Invalid OTP" });
  }

  if (Date.now() > user.otpExpireTime) {
    return res.status(401).json({ message: "OTP has expired" });
  }

// Removes the OTP value from the user object, so it can't be reused.
// Clears the expiration time for the OTP, since it's no longer needed.
// Sets a flag indicating the user has successfully verified their OTP.
// Saves these changes to the database.

  user.otp = null;
  user.otpExpireTime = null;
  user.isOtpVerified = true;
  await user.save();

  res.status(200).json({ message: "OTP verified successfully" });
});

module.exports = { verifyOtp };
