// src/pages/MeetingsPage.jsx
import { useEffect, useState, useRef } from "react";
import { fetchMeetings, createMeeting, updateMeeting, deleteMeeting } from "../../Services/meetingServices";
import { fetchUser } from "../../Services/services";
import { format } from "date-fns";
import { PlusCircle, Pencil, Trash2, CalendarDays, Users, Clock, ChevronDown, X } from "lucide-react";
import { toast } from "react-toastify";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]); // State to hold all users
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    participants: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showParticipantsDropdown, setShowParticipantsDropdown] = useState(false); // New state for dropdown visibility
  const dropdownRef = useRef(null);

  // Load meetings and users
  useEffect(() => {
    loadMeetings();
    loadUsers();
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
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
      if (isEditing) {
        await updateMeeting(editId, form);
        toast.success("Meeting updated successfully");
      } else {
        await createMeeting(form);
        toast.success("Meeting created successfully");
      }
      setForm({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        participants: [],
      });
      setIsEditing(false);
      setEditId(null);
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
      participants: meeting.participants.map((p) => p._id),
    });
    setIsEditing(true);
    setEditId(meeting._id);
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

  const handleCancelEdit = () => {
    setForm({
      title: "",
      description: "",
      date: "",
      startTime: "",
      endTime: "",
      participants: [],

    });
    setIsEditing(false);
    setEditId(null);
  };

  const toggleParticipant = (userId) => {
    setForm((prevForm) => {
      const newParticipants = prevForm.participants.includes(userId)
        ? prevForm.participants.filter((id) => id !== userId)
        : [...prevForm.participants, userId];
      return { ...prevForm, participants: newParticipants };
    });
  };

  const getParticipantNames = () => {
    if (form.participants.length === 0) {
      return "Select participants...";
    }
    const selectedUsers = users.filter((user) =>
      form.participants.includes(user._id)
    );
    return selectedUsers.map((user) => user.name).join(", ");
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full max-w-6xl mx-auto bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-xl">
      <div className="max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            Meetings
          </h1>
          <p className="text-gray-500 mt-1">Manage your team's meetings and schedules with ease.</p>
        </header>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title and Description */}
              <div className="col-span-full">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                  placeholder="e.g., Q3 Planning Session"
                  required
                />
              </div>
              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3"
                  rows="3"
                  placeholder="Briefly describe the meeting agenda"
                />
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            </div>

            {/* Participants (New UI) */}
            <div className="relative" ref={dropdownRef}>
              <label htmlFor="participants" className="block text-sm font-medium text-gray-700">
                Participants
              </label>
              <div
                className="mt-1 relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-3 px-4 shadow-sm focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 sm:text-sm"
                onClick={() => setShowParticipantsDropdown(!showParticipantsDropdown)}
              >
                <div className="flex flex-wrap gap-2">
                  {form.participants.length > 0 ? (
                    users
                      .filter((user) => form.participants.includes(user._id))
                      .map((user) => (
                        <span
                          key={user._id}
                          className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                        >
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
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
              >
                {isEditing ? (
                  <>
                    <Pencil size={18} className="mr-2" />
                    Update Meeting
                  </>
                ) : (
                  <>
                    <PlusCircle size={18} className="mr-2" />
                    Create Meeting
                  </>
                )}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Meeting List */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Meetings ({meetings.length})</h2>
          <div className="space-y-4">
            {meetings.length === 0 ? (
              <p className="text-gray-500 text-center py-8 border border-gray-200 rounded-xl bg-white shadow-sm">
                No meetings scheduled.
              </p>
            ) : (
              meetings.map((meeting) => (
                <div
                  key={meeting._id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center transition-transform transform hover:scale-[1.01] duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 truncate mb-1">{meeting.title}</h3>
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
                      {meeting.isRecurring && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {meeting.recurrencePattern}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(meeting)}
                      className="p-2 text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors duration-200"
                      title="Edit"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(meeting._id)}
                      className="p-2 text-red-600 rounded-full hover:bg-red-50 transition-colors duration-200"
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
      </div>
    </div>
  );
}