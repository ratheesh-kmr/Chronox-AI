import React, { useState } from "react";
import { IconMail, IconCheck } from "@tabler/icons-react";
import { sendEmailOtp, updateEmail } from "../../Services/services";
import { toast } from "react-toastify";

const ChangeEmailForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSendOtp = async () => {
    if (!email) return setErrors({ email: "Enter email" });

    try {
      setLoading(true);
      await sendEmailOtp({ email });
      toast.success("OTP sent to your email!");
      setOtpSent(true);
      setErrors({});
    } catch (error) {
      setErrors({ email: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp) return setErrors({ otp: "Enter OTP" });

    try {
      setLoading(true);
      // ✅ Send as newEmail to match controller
      await updateEmail({ newEmail: email, otp });
      toast.success("Email updated successfully!");
      setErrors({});
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      toast.error(error.message || "Something went wrong");
      setErrors({ otp: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl shadow-lg w-full max-w-md bg-white">
      <h2 className="text-lg font-bold mb-4 text-purple-700">Change Email</h2>
      <form onSubmit={handleVerify}>
        {successMessage && (
          <div className="bg-green-100 text-green-800 text-sm p-2 rounded mb-3 border border-green-400">
            {successMessage}
          </div>
        )}
        <div className="mb-3">
          <label className="flex items-center gap-2 text-sm mb-1 text-purple-600">
            <IconMail size={16} /> New Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({});
            }}
            className="w-full p-2 border rounded-md text-sm text-black border-gray-400"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            className="text-xs text-blue-600 underline mt-2"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>

        {otpSent && (
          <div className="mb-3">
            <label className="flex items-center gap-2 text-sm mb-1 text-purple-600">
              <IconCheck size={16} /> OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setErrors({});
              }}
              className="w-full p-2 border rounded-md text-sm text-black border-gray-400"
            />
            {errors.otp && <p className="text-xs text-red-500">{errors.otp}</p>}
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Update"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-purple-600 underline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangeEmailForm;
