import { useEffect, useState, useRef } from "react";
import { fetchMeetings, createMeeting, updateMeeting, deleteMeeting } from "../../Services/meetingServices";
import { fetchUser } from "../../Services/services";
import { format, parseISO, isAfter, isBefore, isValid } from "date-fns";
import { PlusCircle, Pencil, Trash2, CalendarDays, Users, Clock, ChevronDown, X, Video } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { JitsiMeeting } from "@jitsi/react-sdk";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    mode: "Online",
    startTime: "",
    endTime: "",
    participants: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState(null);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const loadMeetings = async () => {
    try {
      const data = await fetchMeetings();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load meetings");
    }
  };

  const loadUsers = async () => {
    try {
      const data = await fetchUser();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      mode: "Online",
      startTime: "",
      endTime: "",
      participants: [],
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const toDateFromDateAndTime = (dateStr, timeStr) => {
    if (!dateStr) return null;
    let base = parseISO(dateStr);
    if (!isValid(base)) base = new Date(dateStr);
    if (!timeStr) return base;
    const [hh, mm] = (timeStr || "").split(":").map((n) => Number(n) || 0);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm, 0, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      await Swal.fire({ icon: "error", title: "Title required", text: "Please enter a meeting title." });
      return;
    }
    if (!form.date) {
      await Swal.fire({ icon: "error", title: "Date required", text: "Please select a meeting date." });
      return;
    }
    if (!form.startTime) {
      await Swal.fire({ icon: "error", title: "Start time required", text: "Please select a start time." });
      return;
    }

    const startDT = toDateFromDateAndTime(form.date, form.startTime);
    const endDT = toDateFromDateAndTime(form.date, form.endTime || form.startTime);
    const now = new Date();

    if (endDT && isBefore(endDT, startDT)) {
      await Swal.fire({ icon: "error", title: "Invalid time range", text: "End time must be after start time." });
      return;
    }
    if (endDT && isBefore(endDT, now)) {
      await Swal.fire({ icon: "error", title: "Date in past", text: "Meeting end time is already in the past." });
      return;
    }

    const payload = { ...form }; // link is auto-generated in backend

    try {
      if (isEditing && editId) {
        await updateMeeting(editId, payload);
        toast.success("Meeting updated successfully");
      } else {
        await createMeeting(payload);
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
      title: meeting.title || "",
      description: meeting.description || "",
      date: (meeting.date || "").split("T")[0] || (meeting.date || ""),
      startTime: meeting.startTime || "",
      endTime: meeting.endTime || "",
      mode: meeting.mode || "Online",
      participants: (meeting.participants || []).map((p) => (typeof p === "string" ? p : p?._id)),
    });
    setIsEditing(true);
    setEditId(meeting._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete meeting?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteMeeting(id);
        toast.success("Meeting deleted");
        loadMeetings();
      } catch (err) {
        toast.error("Error deleting meeting");
      }
    }
  };

  const toggleParticipant = (userId) => {
    setForm((prevForm) => {
      const newParticipants = prevForm.participants.includes(userId)
        ? prevForm.participants.filter((id) => id !== userId)
        : [...prevForm.participants, userId];
      return { ...prevForm, participants: newParticipants };
    });
  };

  const now = new Date();
  const upcomingMeetings = meetings
    .map((m) => ({ ...m, _end: toDateFromDateAndTime(m.date, m.endTime || m.startTime) }))
    .filter((m) => m._end && isAfter(m._end, now))
    .sort((a, b) => a._end - b._end);

  const completedMeetings = meetings
    .map((m) => ({ ...m, _end: toDateFromDateAndTime(m.date, m.endTime || m.startTime) }))
    .filter((m) => m._end && !isAfter(m._end, now))
    .sort((a, b) => b._end - a._end);

  const formatTime12 = (dateOrTimeStr, dateStr) => {
    let d = null;
    if (!dateOrTimeStr) return "";
    if (Object.prototype.toString.call(dateOrTimeStr) === "[object Date]") {
      d = dateOrTimeStr;
    } else {
      d = toDateFromDateAndTime(dateStr || new Date().toISOString().split("T")[0], dateOrTimeStr);
    }
    return isValid(d) ? format(d, "h:mm a") : dateOrTimeStr;
  };

  return (
    <div className="p-6 w-full bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl min-h-screen">
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

      {/* 🔹 Embedded Jitsi Modal */}
      <AnimatePresence>
        {activeMeeting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl w-[90%] h-[85%] overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <h2 className="text-lg font-semibold">{activeMeeting.title}</h2>
                <button
                  onClick={() => setActiveMeeting(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
             <div className="fixed inset-0 z-50 bg-black">
                <JitsiMeeting
                  domain="meet.jit.si"
                  roomName={activeMeeting.link.split("/").pop()}
                  userInfo={{
                    displayName: JSON.parse(sessionStorage.getItem("userData"))?.username || "Guest"
                  }}

                  interfaceConfigOverwrite={{
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_BRAND_WATERMARK: false,
                    SHOW_POWERED_BY: false,
                  }}
                  getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = "100%";
                    iframeRef.style.width = "100%";
                  }}
                />

                {/* Chronox Logo Overlay */}
                <img
                  src="/Chronox_logo.png"
                  alt="Chronox"
                  className="absolute top-3 left-7 w-19 pointer-events-none bg-black"
                />
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 ">
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

                {/* Date, Time, Mode */}
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

                {/* Info: Auto-generated meeting link */}
                {form.mode === "Online" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                    <input
                      type="text"
                      value="Will be auto-generated after saving"
                      readOnly
                      className="mt-1 block w-full border-gray-200 bg-gray-100 rounded-md shadow-sm sm:text-sm p-3 text-gray-500"
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

      {/* Upcoming Meetings */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Upcoming Meetings
            <span className="ml-2 text-sm font-medium text-gray-500">({upcomingMeetings.length})</span>
          </h2>
        </div>

        {upcomingMeetings.length === 0 ? (
          <p className="text-gray-500 text-center py-8 border border-dashed border-gray-300 rounded-xl bg-gray-50 shadow-inner">No upcoming meetings.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMeetings.map((meeting) => {
              const start = toDateFromDateAndTime(meeting.date, meeting.startTime);
              const end = toDateFromDateAndTime(meeting.date, meeting.endTime || meeting.startTime);
              const dateLabel = isValid(parseISO(meeting.date)) ? format(parseISO(meeting.date), "PPP") : meeting.date;
              return (
                <div key={meeting._id} className="group bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition">{meeting.title}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{meeting.description || "No description provided."}</p>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-indigo-500" />
                      <span>{dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-pink-500" />
                      <span>{start ? format(start, "h:mm a") : meeting.startTime} – {end ? format(end, "h:mm a") : meeting.endTime}</span>
                    </div>
                    {meeting.participants?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-green-500" />
                        <span className="truncate">{(meeting.participants || []).map((p) => (typeof p === "string" ? users.find((u) => u._id === p)?.name || p : p.name)).join(", ")}</span>
                      </div>
                    )}

                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">Mode: {meeting.mode}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-4 border-t pt-3">
                    <button
                      onClick={() => handleEdit(meeting)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(meeting._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                    {meeting.link && meeting.mode === "Online" && (
  <button
    onClick={() => {
      const url = meeting.link;
      // Open in a new window with defined size (or "_blank" for new tab)
      window.open(url, "_blank", "width=1200,height=800");
    }}
    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
  >
    <Video size={16} />
    Join
  </button>
)}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed Meetings */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Completed Meetings <span className="ml-2 text-sm font-medium text-gray-500">({completedMeetings.length})</span></h2>
        </div>

        {completedMeetings.length === 0 ? (
          <p className="text-gray-500 text-center py-8 border border-dashed border-gray-300 rounded-xl bg-gray-50 shadow-inner">No completed meetings.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedMeetings.map((meeting) => {
              const start = toDateFromDateAndTime(meeting.date, meeting.startTime);
              const end = toDateFromDateAndTime(meeting.date, meeting.endTime || meeting.startTime);
              const dateLabel = isValid(parseISO(meeting.date)) ? format(parseISO(meeting.date), "PPP") : meeting.date;
              return (
                <div key={meeting._id} className="group bg-gray-50 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 opacity-80 group-hover:text-indigo-600 transition">{meeting.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{meeting.description || "No description provided."}</p>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-indigo-400" />
                      <span>{dateLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-pink-400" />
                      <span>{start ? format(start, "h:mm a") : meeting.startTime} – {end ? format(end, "h:mm a") : meeting.endTime}</span>
                    </div>
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">Mode: {meeting.mode}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
