import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, forgotPassword, sendOtp, verifyOtp } from "../../Services/services";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loader from "../Loader/Loader";
import {motion} from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors({});
    setServerError("");
  };

  const validate = () => {
    const err = {};
    if (!formData.email) err.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = "Invalid email format.";
    if (!formData.password) err.password = "Password is required.";
    else if (formData.password.length < 6) err.password = "Min 6 characters required.";
    return err;
  };

  const routeByRole = (role) => {
    switch (role) {
      case "EMPLOYEE":
        navigate("/EmployeeDashboard", { replace: true });
        break;
      case "TEAM_LEAD":
        navigate("/TeamLeadDashboard", { replace: true });
        break;
      case "ADMIN":
        navigate("/dashboard", { replace: true });
        break;
      case "PROJECT_LEAD":
         navigate("/ProjectPage", { replace: true });
        break;
      case "SUPER_ADMIN":
        navigate("/dashboard", { replace: true });
        break;
      default:
        navigate("/login", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  if (formData.email === formData.password) {
    setErrors({ emailPasswordMatch: "Email and password cannot be the same." });
    return;
  }

  try {
    setLoading(true); // Start loader
    const response = await login(formData);

    if (!response?.success) {
      setServerError(response.message || "Login failed.");
      setLoading(false);
      return;
    }

   const { token, role, team, ...userData } = response.data;

sessionStorage.setItem("token", token);
sessionStorage.setItem("role", role.toUpperCase());
sessionStorage.setItem("userData", JSON.stringify(userData));
sessionStorage.setItem("teamId", team);



    // Simulate redirection delay
    setTimeout(() => {
      routeByRole(role);
    }, 500); 
  } catch (error) {
    setServerError("An unexpected error occurred. Please try again.");
    setLoading(false);
  }
};


  // ===== Forgot Password Handlers =====
const handleSendOtp = async () => {
  if (!forgotEmail) return alert("Please enter your email");

  try {
    await sendOtp(forgotEmail);
    setOtpSent(true);
    alert("OTP sent to your email");
  } catch (err) {
    alert(err.message || "Failed to send OTP");
  }
};

const handleResetPassword = async () => {
  if (!otp || !newPassword || !confirmPassword) {
    return alert("Please fill all fields");
  }

  if (newPassword !== confirmPassword) {
    return alert("Passwords do not match");
  }

  try {
    await forgotPassword({ email: forgotEmail, otp, password: newPassword }); 
    alert("Password reset successful");
    setShowForgotModal(false);
    setOtpSent(false);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotEmail("");
  } catch (err) {
    alert(err.message || "Failed to reset password");
  }
};

//Slide animation
const slideRight = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 80, damping: 18 } },
  exit: { x: "-100%", opacity: 0, transition: { duration: 0.3 } },
};
//flipAnimation
const flipAnimation = {
  initial: { rotateY: 90, opacity: 0 },
  animate: { rotateY: 0, opacity: 1, transition: { duration: 0.5 } },
  exit: { rotateY: -90, opacity: 0, transition: { duration: 0.4 } },
};


  return (
   <motion.div
    variants={flipAnimation}
    initial="initial"
    animate="animate"
    exit="exit"
    className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8"
  >
    <div >

      <div >
        <div >
          {loading ? (
            <Loader message="Logging in..." />
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring focus:border-gray-400 bg-white"
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full mt-1 p-3 border-2 border-gray-200 rounded-xl pr-10 focus:outline-none focus:ring focus:border-gray-400  bg-white"
                      placeholder="Enter your password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                {errors.emailPasswordMatch && (
                  <p className="text-red-500 text-sm text-center">{errors.emailPasswordMatch}</p>
                )}
                {serverError && (
                  <p className="text-red-500 text-sm text-center">{serverError}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
                >
                  Login
                </button>

                <div className="flex justify-between text-sm mt-3">
                  <p
                    className="text-indigo-600 hover:underline cursor-pointer"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot Password?
                  </p>
              <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-orange-500 font-medium hover:underline">
                    Register now.
                  </Link>
                </div>
                </div>
              </form>
            </>
          )}

          {/* Forgot Password Modal */}
          {showForgotModal && (
            <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 shadow-xl rounded-2xl">
              <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl  w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>

                {!otpSent ? (
                  <>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring focus:border-gray-400"
                    />
                    <button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
                      onClick={handleSendOtp}
                    >
                      Send OTP
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring focus:border-gray-400"
                    />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring focus:border-gray-400"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl mb-3 focus:outline-none focus:ring focus:border-gray-400"
                    />
                    <button
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
                      onClick={handleResetPassword}
                    >
                      Reset Password
                    </button>
                  </>
                )}

                <button
                  className="mt-5 w-full text-sm text-red-500 font-medium underline hover:text-red-700 transition"
                  onClick={() => {
                    setShowForgotModal(false);
                    setOtpSent(false);
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setForgotEmail("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  </motion.div>
  );
};

export default Login;
