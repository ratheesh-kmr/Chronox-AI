const crypto = require("crypto");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();

const sendEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashOtp = crypto.createHash("sha256").update(otp).digest("hex");

  user.otp = hashOtp;
  user.otpExpireTime = Date.now() + 5 * 60 * 1000;
  user.isOtpVerified = false;
  user.pendingEmail = email;
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
        <h2>Email Change OTP</h2>
        <p>Your OTP is: <strong style="font-size: 18px;">${otp}</strong></p>
        <p>This OTP will expire in <strong>5 minutes</strong>.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    console.error("Failed to send email OTP:", error);
    res.status(500).json({ message: "Failed to send OTP email" });
  }
});

module.exports = { sendEmailOtp };
