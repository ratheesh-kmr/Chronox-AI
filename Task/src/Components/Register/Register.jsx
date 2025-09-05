import React, { useEffect, useState } from "react";
import { register, fetchTeamsPublic } from "../../Services/services";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    team: "",
    role: "EMPLOYEE",
    mobileNo: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const fetchedTeams = await fetchTeamsPublic();
        setTeams(fetchedTeams);
        if (fetchedTeams.length > 0) {
          setFormData(prev => ({ ...prev, team: fetchedTeams[0]._id }));
        }
      } catch (err) {
        setError("Failed to load teams.");
      }
    };
    loadTeams();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation checks
    if (!/^[0-9]{10}$/.test(formData.mobileNo)) {
      setError("Mobile number must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      // Only execute success logic if no error occurred
      toast.success("Registration request sent successfully. Awaiting admin approval.");
      navigate("/login");
    } catch (err) {
      // Extract the specific error message from the server response
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      
      // Set the error state to display the specific error
      setError(errorMessage);
      
      // Show appropriate toast message based on the error
      if (errorMessage === "Email Exist") {
        toast.error("This email is already registered. Please use a different email.");
      } else if (errorMessage === "Mobile Number Exist") {
        toast.error("This mobile number is already registered. Please use a different number.");
      } else if (errorMessage === "Team not found") {
        toast.error("Selected team is invalid. Please refresh and try again.");
      } else {
        toast.error(errorMessage);
      }
      
      // Important: Don't continue execution after error
      setLoading(false);
      return;
    } finally {
      // Only set loading to false if we're in the success path
      // (the error path already sets it to false above)
      if (!error) {
        setLoading(false);
      }
    }
  };

  // Animation variants
  const flipAnimation = {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1, transition: { duration: 0.5 } },
    exit: { rotateY: -90, opacity: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8"
      variants={flipAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Create Your Account</h2>
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-6 border border-red-200">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            onChange={handleChange}
            className="w-full p-1 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring focus:border-gray-400"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            onChange={handleChange}
            className="w-full p-1 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring focus:border-gray-400"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            onChange={handleChange}
            className="w-full p-1 pr-10 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring focus:border-gray-400"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 cursor-pointer text-gray-600"
          >
            {showPassword ? <IconEye /> : <IconEyeClosed />}
          </span>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            onChange={handleChange}
            className="w-full p-1 pr-10 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring focus:border-gray-400"
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-8 cursor-pointer text-gray-600"
          >
            {showConfirmPassword ? <IconEye /> : <IconEyeClosed />}
          </span>
        </div>

        {/* Team */}
        <div>
          <label htmlFor="team" className="block text-sm font-semibold text-gray-700 mb-1">Team</label>
          <div className="relative">
            <select
              id="team"
              name="team"
              required
              onChange={handleChange}
              value={formData.team}
              className="w-full p-1 border-2 border-gray-200 rounded-xl bg-white appearance-none focus:outline-none focus:ring focus:border-gray-400"
            >
              <option value="" disabled>Select a team</option>
              {teams.map((team) => (
                <option key={team._id} value={team._id}>{team.teamName}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>

        {/* Role */}
        <div className="relative">
          <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
          <select
            id="role"
            name="role"
            required
            onChange={handleChange}
            value={formData.role}
            className="w-full appearance-none border-2 border-gray-200 rounded-xl bg-white px-3 py-2 pr-10 focus:outline-none focus:ring focus:border-gray-400"
          >
            <option value="EMPLOYEE">Employee</option>
            <option value="TEAM_LEAD">Team Lead</option>
            <option value="PROJECT_LEAD">Project Lead</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
          <div className="pointer-events-none absolute top-5 inset-y-0 right-0 flex items-center px-3 text-gray-700">
            <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
          </div>
        </div>

        {/* Mobile */}
        <div>
          <label htmlFor="mobileNo" className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number</label>
          <input
            id="mobileNo"
            name="mobileNo"
            type="tel"
            required
            pattern="[0-9]{10}"
            maxLength={10}
            minLength={10}
            onChange={handleChange}
            className="w-full p-1 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:ring focus:border-gray-400"
            onKeyPress={(e) => !/[0-9]/.test(e.key) && e.preventDefault()}
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-1">Joining Date</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            onChange={handleChange}
            className="w-full p-1 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring focus:border-gray-400 bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="text-center text-sm mt-3">
          Already have an account?{" "}
          <button 
            onClick={() => navigate("/login")}
            className="text-blue-400 hover:underline cursor-pointer"
          > 
            Login now.
          </button>
        </div>
      </form>
    </motion.div>
  );
}