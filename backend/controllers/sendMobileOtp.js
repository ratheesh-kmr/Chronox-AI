const twilio = require("twilio");
const crypto = require("crypto");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");

const sendMobileOtp = asyncHandler(async (req, res) => {
  const { mobile } = req.body;

  if (!mobile) {
    return res.status(400).json({ message: "Mobile number is required" });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashOtp = crypto.createHash("sha256").update(otp).digest("hex");

  // Save OTP & expiry
  user.otp = hashOtp;
  user.otpExpireTime = Date.now() + 5 * 60 * 1000; // 5 minutes
  user.isOtpVerified = false;
  user.pendingMobile = mobile;
  await user.save();

  // Twilio client
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Ensure correct mobile format
  let formattedMobile = mobile;
  if (!formattedMobile.startsWith("+")) {
    formattedMobile = `+91${formattedMobile}`; // default to India
  }

  // Send OTP via SMS
  await client.messages.create({
    body: `Your OTP code is: ${otp}`,
    from: process.env.TWILIO_PHONE, // must be a verified Twilio number
    to: formattedMobile,
  });

  res.status(200).json({ message: "OTP sent to mobile" });
});

module.exports = { sendMobileOtp };
