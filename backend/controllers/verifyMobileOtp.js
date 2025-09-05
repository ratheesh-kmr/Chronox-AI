const crypto = require("crypto");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const verifyMobileOtp = asyncHandler(async (req, res) => {
  const { newMobile, otp } = req.body;

  if (!otp || !newMobile) {
    return res.status(400).json({ message: "OTP and new mobile number are required" });
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

  // Update mobile number
  user.mobile = newMobile;
  user.pendingMobile = null;
  user.otp = null;
  user.otpExpireTime = null;
  user.isOtpVerified = true;

  await user.save();

  res.status(200).json({ message: "Mobile number updated successfully", mobile: user.mobile });
});

module.exports = { verifyMobileOtp };
