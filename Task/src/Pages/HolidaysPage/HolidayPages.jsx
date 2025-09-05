import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import {
  fetchHolidays,
  createHolidays,
  updateHolidays,
  deleteHolidays,
  deleteAllHolidays,
} from "../../Services/services";
import {
  IconTrash,
  IconEdit,
  IconX,
  IconPlus,
  IconAlertTriangle,
} from "@tabler/icons-react";
import "react-calendar/dist/Calendar.css";

// Initial form state
const initialFormState = {
  holidayName: "",
  holidayDate: "",
  description: "",
};

const HolidaysPage = () => {
  // State declarations
  const [holidays, setHolidays] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Set user role from session storage
  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    setUserRole(storedRole);
  }, []);

  // Load holidays on component mount
  useEffect(() => {
    loadHolidays();
  }, []);

  // Authorization check
  const isAuthorized =
    userRole === "ADMIN" ||
    userRole === "PROJECT_LEAD" ||
    userRole === "SUPER_ADMIN";

  // Load holidays from API
  const loadHolidays = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHolidays();
      const sortedHolidays = data.sort(
        (a, b) => new Date(a.holidayDate) - new Date(b.holidayDate)
      );
      setHolidays(sortedHolidays || []);
    } catch (err) {
      setError("Failed to load holidays. Please try again.");
      console.error("Error fetching holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
  };

  // Handle form submission (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.holidayName || !formData.holidayDate) return;

    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateHolidays(editingId, formData);
      } else {
        await createHolidays(formData);
      }
      resetForm();
      loadHolidays();
    } catch (err) {
      setError(`Failed to ${editingId ? "update" : "add"} holiday. Try again.`);
      console.error("Error saving holiday:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (holiday) => {
    setFormData({
      holidayName: holiday.holidayName,
      holidayDate: holiday.holidayDate.split("T")[0],
      description: holiday.description || "",
    });
    setEditingId(holiday._id);
  };

  // Handle delete single holiday
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;

    setLoading(true);
    setError(null);
    try {
      await deleteHolidays(id);
      loadHolidays();
    } catch (err) {
      setError("Failed to delete holiday. Try again.");
      console.error("Error deleting holiday:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete all holidays
  const handleDeleteAll = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete ALL holidays? This action cannot be undone."
      )
    )
      return;

    setLoading(true);
    setError(null);
    try {
      await deleteAllHolidays();
      loadHolidays();
    } catch (err) {
      setError("Failed to delete all holidays. Try again.");
      console.error("Error deleting all holidays:", err);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getHolidaysForDate = (date) => {
    return holidays.filter(
      (holiday) =>
        new Date(holiday.holidayDate).toDateString() === date.toDateString()
    );
  };

  // Calendar tile styling
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const isToday =
        date.toDateString() === new Date().toDateString() ? "today-tile" : "";
      const hasHoliday =
        getHolidaysForDate(date).length > 0 ? "holiday-tile" : "";
      return `${isToday} ${hasHoliday}`;
    }
    return null;
  };

  // Calendar tile content
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayHolidays = getHolidaysForDate(date);
      if (dayHolidays.length > 0) {
        return (
          <div className="flex justify-center mt-1">
            <span className="text-xs font-semibold text-[#8F87F1] truncate max-w-full px-1 rounded bg-[#e1d9ff]">
              {dayHolidays[0].holidayName.split(" ")[0]}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  // Get holidays for current selected month
  const currentMonthHolidays = holidays.filter(
    (h) =>
      new Date(h.holidayDate).getMonth() === selectedDate.getMonth() &&
      new Date(h.holidayDate).getFullYear() === selectedDate.getFullYear()
  );

  return (
    <>
      {/* Custom CSS Styles (keep them as is) */}
      <style>{`
        .react-calendar {
          border-radius: 1rem;
          box-shadow: 0 10px 20px rgba(143, 135, 241, 0.3);
          font-family: 'Inter', sans-serif;
          border: none;
        }

        /* Adjust width for small screens */
        .react-calendar {
            width: 100%;
        }

        .react-calendar__navigation button {
          color: #8F87F1;
          font-weight: 600;
          background: transparent;
          border: none;
          padding: 8px 16px;
          border-radius: 0.75rem;
          transition: background-color 0.25s ease;
        }
        
        .react-calendar__navigation button:hover,
        .react-calendar__navigation button:focus {
          background-color: #C68EFD;
          color: white;
          outline: none;
          box-shadow: 0 4px 10px rgb(198 142 253 / 0.5);
        }
        
        .react-calendar__month-view__days__day {
          border-radius: 0.5rem;
          padding: 0.5rem 0;
          transition: background-color 0.25s ease, color 0.25s ease;
          cursor: pointer;
          font-weight: 500;
        }
        
        .react-calendar__month-view__days__day:hover {
          background-color: #F3E8FF;
          color: #8F87F1;
          box-shadow: 0 4px 10px rgb(143 135 241 / 0.3);
        }
        
        .react-calendar__tile--now {
          background: #8F87F1;
          color: white !important;
          font-weight: 700;
          border-radius: 0.75rem;
          box-shadow: 0 0 10px #8F87F1;
        }
        
        .holiday-tile {
          background-color: #e1d9ff;
          color: #5a3ea1;
          font-weight: 600;
          border-radius: 0.75rem;
          box-shadow: inset 0 0 8px #8F87F1;
          transition: background-color 0.3s ease;
        }
        
        .holiday-tile:hover {
          background-color: #c8b1ff;
          color: #371c9c;
          box-shadow: 0 0 12px #6f6af0;
        }
        
        .react-calendar__month-view {
          margin-top: 1rem;
        }
      `}</style>

      {/* Main Container */}
      <div className="p-4 sm:p-6 space-y-6 w-full max-w-6xl mx-auto bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-xl">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <h1 className="text-2xl font-bold">Holidays</h1>
          {isAuthorized && (
            <button
              onClick={handleDeleteAll}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
              disabled={holidays.length === 0 || loading}
            >
              <IconTrash size={16} /> Delete All
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2"
            role="alert"
          >
            <IconAlertTriangle size={20} />
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        {/* Holiday Form (Only for authorized users) */}
        {isAuthorized && (
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow p-4 sm:p-6 space-y-4 transition-all"
          >
            <div className="grid md:grid-cols-2 gap-4">
              {/* Holiday Name Input */}
              <div>
                <label className="text-sm text-gray-600 font-medium mb-1 block">
                  Holiday Name
                </label>
                <input
                  name="holidayName"
                  type="text"
                  placeholder="e.g. Diwali"
                  value={formData.holidayName}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#8F87F1] text-sm"
                  required
                />
              </div>

              {/* Holiday Date Input */}
              <div>
                <label className="text-sm text-gray-600 font-medium mb-1 block">
                  Holiday Date
                </label>
                <input
                  name="holidayDate"
                  type="date"
                  value={formData.holidayDate}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#8F87F1] text-sm"
                  required
                />
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="text-sm text-gray-600 font-medium mb-1 block">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Optional description..."
                value={formData.description}
                onChange={handleChange}
                className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#8F87F1] text-sm"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-[#8F87F1] hover:bg-[#6f6af0] text-white px-4 py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                disabled={loading}
              >
                <IconPlus size={18} />
                {editingId ? "Update Holiday" : "Add Holiday"}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center justify-center gap-1 text-red-500 hover:text-red-700 disabled:opacity-50 w-full sm:w-auto"
                  disabled={loading}
                >
                  <IconX size={18} /> Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Calendar Section */}
          <div className="rounded-2xl p-0 sm:p-4 transition-all overflow-hidden">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              locale="en-IN"
              className="w-full border-none p-0 sm:p-5"
              tileClassName={tileClassName}
              tileContent={tileContent}
            />
          </div>

          {/* Holiday List Section */}
          <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow p-4 sm:p-6 space-y-4">
            <h2 className="text-xl font-bold">
              Holidays in{" "}
              {selectedDate.toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            {/* Loading State */}
            {loading ? (
              <div className="text-center text-gray-500">
                Loading holidays...
              </div>
            ) : currentMonthHolidays.length > 0 ? (
              
              /* Holiday Cards */
              <div className="space-y-3">
                {currentMonthHolidays.map((holiday) => (
                  <div
                    key={holiday._id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  >
                    {/* Holiday Info */}
                    <div>
                      <h3 className="text-base font-semibold text-[#8F87F1]">
                        {holiday.holidayName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(holiday.holidayDate)}
                      </p>
                      {holiday.description && (
                        <p className="text-sm text-gray-500 mt-2">
                          {holiday.description}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons (Only for authorized users) */}
                    {isAuthorized && (
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => handleEdit(holiday)}
                          className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                          disabled={loading}
                          title="Edit Holiday"
                        >
                          <IconEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(holiday._id)}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          disabled={loading}
                          title="Delete Holiday"
                        >
                          <IconTrash size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              
              /* Empty State */
              <div className="text-center text-gray-500">
                No holidays found in this month.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HolidaysPage;