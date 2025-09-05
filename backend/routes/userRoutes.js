const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getLoggedInUser,
  getUser,
  getUserLog,
  updatePassword,
  Approve,
  Reject,
  getSkillCount,
  restoreUser,
  AllRestoreUser,
  getPendingUsers,
  deleteUser,
  UpdateUserById,
  deleteAllUser,
  registerApprovedUser,
  getDeletedUser,
  getUnassignedUsers,
  updateUserStatus,
  
} = require("../controllers/userController");
const { authMiddleware } = require("../middleware/authMiddleware");

const { verifyOtp } = require("../controllers/verifyotp");
const { sendOtp } = require("../controllers/sentotp");
const {sendEmailOtp} = require("../controllers/sendEmailOtp");
const {sendMobileOtp} = require("../controllers/sendMobileOtp");
const {verifyEmailOtp} = require("../controllers/verifyEmailOtp");
const {verifyMobileOtp} = require("../controllers/verifyMobileOtp");

router.put("/resetPassword",updatePassword);
router.post("/sendOtp",sendOtp);
router.post("/verifyOtp",verifyOtp);

router.post("/send-mobile-otp",sendMobileOtp);
router.post("/verify-mobile-otp",verifyMobileOtp);
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp",verifyEmailOtp);

router.put("/approve/:id", authMiddleware, Approve);
router.put("/reject/:id", authMiddleware, Reject);
router.get("/getPendingUsers", getPendingUsers);
router.delete("/delete/:id", authMiddleware, deleteUser);
router.put("/:id", authMiddleware, UpdateUserById);


router.get("/deletedUser",authMiddleware, getDeletedUser);
router.route("/skillCount").get(authMiddleware,getSkillCount);
router.route("/restore/:id").put(authMiddleware, restoreUser);
router.route("/allRestore").put(authMiddleware, AllRestoreUser);

router.delete("/deleteAll", authMiddleware, deleteAllUser);

router.route("/approveUser").post(authMiddleware, registerApprovedUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getLoggedInUser);
router.get("/user/log", getUserLog);
router.get("/user", getUser);

router.get("/unassigned", authMiddleware, getUnassignedUsers);

router.patch("/:id/status",authMiddleware,updateUserStatus);

module.exports = router;
