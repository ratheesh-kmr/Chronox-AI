import React, { useState } from "react";
import { IconLock, IconCheck } from "@tabler/icons-react";
import { changePassword } from "../../Services/services"; 
import { toast } from "react-toastify";

const InputField = ({ label, value, type = "text", error, onChange, icon: Icon, placeholder }) => (
  <div className="mb-3">
    <label className="flex items-center gap-2 text-sm text-purple-700 mb-1">
      {Icon && <Icon size={16} />}
      {label}
    </label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = formData;
    const newErrors = {};

    // Frontend validations
    if (!currentPassword) newErrors.currentPassword = "Current password is required";
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
    if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    
    try {
      setIsSubmitting(true);
      await changePassword({ currentPassword, newPassword }); 
      // setSuccessMessage("Password updated successfully!");
      toast.success("Password updated successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      setErrors({});
    } catch (error) {
      // setErrors({ general: error.message });
      toast.error(error.message || "Failed to update password");
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl">
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
          {successMessage}
        </div>
      )}

      {/* General error */}
      {errors.general && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {errors.general}
        </div>
      )}

      <InputField
        label="Current Password"
        type="password"
        value={formData.currentPassword}
        error={errors.currentPassword}
        onChange={(val) => handleChange("currentPassword", val)}
        icon={IconLock}
        placeholder="Enter your current password"
      />
      <InputField
        label="New Password"
        type="password"
        value={formData.newPassword}
        error={errors.newPassword}
        onChange={(val) => handleChange("newPassword", val)}
        icon={IconLock}
        placeholder="Enter your new password"
      />
      <InputField
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        error={errors.confirmPassword}
        onChange={(val) => handleChange("confirmPassword", val)}
        icon={IconCheck}
        placeholder="Confirm your new password"
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-purple-600 text-white py-2 rounded-md transition duration-200 ${
          isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
        }`}
      >
        {isSubmitting ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
};

export default ChangePasswordForm;
