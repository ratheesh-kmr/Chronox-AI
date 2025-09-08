import { useEffect, useState, useRef } from "react";
import { fetchMeetings, createMeeting, updateMeeting, deleteMeeting } from "../../Services/meetingServices";
import { fetchUser } from "../../Services/services";
import { format } from "date-fns";
import { PlusCircle, Pencil, Trash2, CalendarDays, Users, Clock, ChevronDown, X } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { isAfter, isBefore, parse, parseISO } from "date-fns";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    link: "",
    mode: "Online",
    startTime: "",
    endTime: "",
    participants: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadMeetings();
    loadUsers();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowParticipantsDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const loadMeetings = async () => {
    try {
      const data = await fetchMeetings();
      setMeetings(data);
    } catch (error) {
      toast.error("Failed to load meetings");
    }
  };

  const loadUsers = async () => {
    try {
      const data = await fetchUser();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.mode === "Online" && !form.link.trim()) {
        toast.error("Meeting link is required for Online mode");
        return;
      }

      if (isEditing) {
        await updateMeeting(editId, form);
        toast.success("Meeting updated successfully");
      } else {
        await createMeeting(form);
        toast.success("Meeting created successfully");
      }

      resetForm();
      loadMeetings();
    } catch (error) {
      toast.error("Error saving meeting");
    }
  };

  const handleEdit = (meeting) => {
    setForm({
      title: meeting.title,
      description: meeting.description,
      date: meeting.date.split("T")[0],
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      mode: meeting.mode,
      link: meeting.link || "",
      participants: meeting.participants.map((p) => p._id),
    });
    setIsEditing(true);
    setEditId(meeting._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await deleteMeeting(id);
      toast.success("Meeting deleted");
      loadMeetings();
    } catch {
      toast.error("Error deleting meeting");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      link: "",
      mode: "Online",
      startTime: "",
      endTime: "",
      participants: [],
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const toggleParticipant = (userId) => {
    setForm((prevForm) => {
      const newParticipants = prevForm.participants.includes(userId)
        ? prevForm.participants.filter((id) => id !== userId)
        : [...prevForm.participants, userId];
      return { ...prevForm, participants: newParticipants };
    });
  };

  const getMeetingDateTime = (meeting, useEnd = false) => {
  const baseDate = parseISO(meeting.date); 
  const timeStr = useEnd ? meeting.endTime : meeting.startTime; 
  const [hours, minutes] = timeStr.split(":").map(Number);
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes
  );
};

const now = new Date();
const upcomingMeetings = meetings.filter((m) =>
  isAfter(getMeetingDateTime(m, true), now) 
);
const completedMeetings = meetings.filter((m) =>
  isBefore(getMeetingDateTime(m, true), now) 
);

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Meetings</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle size={18} />
          {showForm ? "Close Form" : "New Meeting"}
        </button>
      </div>

      {/* Expandable Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                    rows="3"
                  />
                </div>

                {/* Date, Time, Mode, Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      id="date"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      id="startTime"
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                      id="endTime"
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mode</label>
                    <select
                      value={form.mode}
                      onChange={(e) => setForm({ ...form, mode: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                    >
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

                {/* Meeting Link (only if Online) */}
                {form.mode === "Online" && (
                  <div>
                    <label htmlFor="link" className="block text-sm font-medium text-gray-700">Meeting Link</label>
                    <input
                      id="link"
                      type="text"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                      required={form.mode === "Online"}
                    />
                  </div>
                )}

                {/* Participants */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700">Participants</label>
                  <div
                    className="mt-1 relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-3 px-4 shadow-sm"
                    onClick={() => setShowParticipantsDropdown(!showParticipantsDropdown)}
                  >
                    <div className="flex flex-wrap gap-2">
                      {form.participants.length > 0 ? (
                        users
                          .filter((user) => form.participants.includes(user._id))
                          .map((user) => (
                            <span key={user._id} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                              {user.name}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleParticipant(user._id);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))
                      ) : (
                        <span className="text-gray-400">Select participants...</span>
                      )}
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown size={20} className="text-gray-400" />
                    </div>
                  </div>

                  {showParticipantsDropdown && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
                      <ul className="py-1">
                        {users.map((user) => (
                          <li
                            key={user._id}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100"
                            onClick={() => toggleParticipant(user._id)}
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={form.participants.includes(user._id)}
                                readOnly
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                              />
                              <span className="ml-3 block font-normal truncate">
                                {user.name} ({user.email})
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                  >
                    {isEditing ? "Update Meeting" : "Create Meeting"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meeting List */}
     <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Upcoming Meetings ({upcomingMeetings.length})
      </h2>
      <div className="space-y-4">
        {upcomingMeetings.length === 0 ? (
          <p className="text-gray-500 text-center py-8 border border-gray-200 rounded-xl bg-white shadow-sm">
            No upcoming meetings.
          </p>
        ) : (
          upcomingMeetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{meeting.title}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{meeting.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 text-gray-500 text-xs">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    {format(new Date(meeting.date), "PPP")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {meeting.startTime} - {meeting.endTime}
                  </span>
                  {meeting.participants?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users size={14} />
                      {meeting.participants.map((p) => p.name).join(", ")}
                    </span>
                  )}
                  {meeting.link && meeting.mode === "Online" && (
                    <span className="flex items-center gap-1">
                      <a
                        href={meeting.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline"
                      >
                        Join Link
                      </a>
                    </span>
                  )}
                  <span className="flex items-center gap-1">Mode: {meeting.mode}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-4">
                <button
                  onClick={() => handleEdit(meeting)}
                  className="p-2 text-indigo-600 rounded-full hover:bg-indigo-50"
                  title="Edit"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => handleDelete(meeting._id)}
                  className="p-2 text-red-600 rounded-full hover:bg-red-50"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>

    {/* Completed Meetings */}
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Completed Meetings ({completedMeetings.length})
      </h2>
      <div className="space-y-4">
        {completedMeetings.length === 0 ? (
          <p className="text-gray-500 text-center py-8 border border-gray-200 rounded-xl bg-white shadow-sm">
            No completed meetings.
          </p>
        ) : (
          completedMeetings.map((meeting) => (
            <div
              key={meeting._id}
              className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div className="flex-1 min-w-0 opacity-70">
                <h3 className="text-lg font-bold text-gray-700 mb-1">{meeting.title}</h3>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{meeting.description}</p>
                <div className="flex flex-wrap items-center gap-x-4 text-gray-400 text-xs">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    {format(new Date(meeting.date), "PPP")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {meeting.startTime} - {meeting.endTime}
                  </span>
                  <span className="flex items-center gap-1">Mode: {meeting.mode}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
    </div>
  );
}
