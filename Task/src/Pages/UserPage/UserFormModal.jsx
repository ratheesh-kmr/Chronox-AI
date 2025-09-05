import React, { useEffect, useState } from "react";

export default function InlineUserEditFormCard({ initialData, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNo: "", 
    role: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        mobileNo: initialData.mobileNo || "",
        role: initialData.role || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...initialData, ...form });
  };

  return (
    <div className="fixed top-[10px] bottom-[10px] right-0 z-50 w-full sm:w-[400px] rounded-l-2xl bg-gradient-to-br from-purple-100 via-white to-pink-100 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200">
      <form
        onSubmit={handleSubmit}
        className="h-full overflow-y-auto p-6 flex flex-col gap-5"
      >
        <h3 className="text-2xl font-bold text-purple-700 border-b border-purple-200 pb-3 mb-3">
           Edit User
        </h3>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

         {/* Phone ✅ */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="mobileNo"
            value={form.mobileNo}
            onChange={handleChange}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
          />
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="px-4 py-2 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
          >
            <option value="">Select role</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_LEAD">Project Lead</option>
            <option value="TEAM_LEAD">Team Lead</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 mt-auto pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
