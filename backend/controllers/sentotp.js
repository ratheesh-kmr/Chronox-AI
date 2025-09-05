const crypto = require("crypto");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashOtp = crypto.createHash("sha256").update(otp).digest("hex");

  user.otp = hashOtp;
  user.otpExpireTime = Date.now() + 5 * 60 * 1000; // 5 mins
  user.isOtpVerified = false; // reset verification flag
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const mailOptions = {
    from: `Task Management System <${process.env.EMAIL}>`,
    to: email,
    subject: "OTP Verification - Task Management System",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>OTP Verification</h2>
        <p>Your OTP is: <strong style="font-size: 18px;">${otp}</strong></p>
        <p>This OTP will expire in <strong>5 minutes</strong>.</p>
        <p style="color: red;"><strong>Do not share this OTP with anyone.</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

module.exports = { sendOtp };
