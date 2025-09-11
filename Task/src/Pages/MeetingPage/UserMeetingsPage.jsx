import { useEffect, useState } from "react";
import { fetchUserMeetings } from "../../Services/meetingServices";
import { format, isAfter, isBefore, isToday, parseISO, isValid, isSameDay, isWithinInterval } from "date-fns";
import {
  CalendarDays,
  Clock,
  Users,
  Video,
  RefreshCcw,
  Filter,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Helper: Jitsi iframe
function JitsiMeetingFrame({ roomName, userInfo, domain }) {
  return (
    <iframe
      src={`https://${domain}/${roomName}#userInfo.displayName="${encodeURIComponent(
        userInfo.displayName
      )}"`}
      allow="camera; microphone; fullscreen; display-capture"
      className="w-full h-full rounded-xl shadow-lg"
    />
  );
}

export default function UserMeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const data = await fetchUserMeetings();
      setMeetings(data);
    } catch (err) {
      toast.error("Failed to fetch your meetings");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper function to create date from date string and time string
  const toDateFromDateAndTime = (dateStr, timeStr) => {
    if (!dateStr) return null;
    let base = parseISO(dateStr);
    if (!isValid(base)) base = new Date(dateStr);
    if (!timeStr) return base;
    const [hh, mm] = (timeStr || "").split(":").map((n) => Number(n) || 0);
    return new Date(base.getFullYear(), base.getMonth(), base.getDate(), hh, mm, 0, 0);
  };

  // ✅ Check if user can join the meeting (same date and within time range)
  const canJoinMeeting = (meeting) => {
    const now = new Date();
    const meetingDate = parseISO(meeting.date);
    
    // Check if today is the meeting date
    if (!isSameDay(now, meetingDate)) {
      return false;
    }
    
    const startTime = toDateFromDateAndTime(meeting.date, meeting.startTime);
    const endTime = toDateFromDateAndTime(meeting.date, meeting.endTime || meeting.startTime);
    
    // If no end time, allow joining from start time onwards
    if (!meeting.endTime) {
      return isAfter(now, startTime) || now.getTime() === startTime.getTime();
    }
    
    // Check if current time is within the meeting time interval
    return isWithinInterval(now, { start: startTime, end: endTime });
  };

  // ✅ Meeting status color & label
  const getMeetingStatus = (meeting) => {
    const now = new Date();
    const meetingDate = new Date(meeting.date);
    if (isToday(meetingDate)) return "Today";
    if (isAfter(meetingDate, now)) return "Upcoming";
    if (isBefore(meetingDate, now)) return "Past";
    return "Unknown";
  };

  // ✅ Filter meetings
  const filteredMeetings = meetings.filter((m) => {
    const status = getMeetingStatus(m);
    if (filter === "all") return true;
    return status.toLowerCase() === filter;
  });

  return (
    <div className="p-6 w-full bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-2xl min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">My Meetings</h1>
        <div className="flex gap-3">
          {/* Filter */}
          <select
            className="px-3 py-2 rounded-xl border shadow-sm focus:ring-2 focus:ring-indigo-400"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="upcoming">Upcoming</option>
            <option value="today">Today</option>
            <option value="past">Past</option>
          </select>
          {/* Refresh */}
          <button
            onClick={loadMeetings}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading meetings...</p>
      ) : filteredMeetings.length === 0 ? (
        <p className="text-gray-600">No meetings found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => {
            const status = getMeetingStatus(meeting);
            const canJoin = canJoinMeeting(meeting);
            const statusColor =
              status === "Today"
                ? "bg-yellow-100 text-yellow-700"
                : status === "Upcoming"
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-700";

            return (
              <motion.div
                key={meeting._id}
                // whileHover={{ scale: 1.00 }}
                className="p-5 rounded-2xl shadow-lg bg-white/70 backdrop-blur-md border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <h2 className="font-semibold text-xl mb-2">{meeting.title}</h2>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusColor}`}
                  >
                    {status}
                  </span>

                  <p className="mt-2 text-sm text-gray-600 flex items-center gap-1">
                    <CalendarDays size={16} /> {format(new Date(meeting.date), "PPPP")}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock size={16} /> {meeting.startTime} - {meeting.endTime}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Users size={16} />{" "}
                    {meeting.participants?.map((m) => m.name).join(", ") || "N/A"}
                  </p>
                </div>

                {meeting.mode === "Online" && meeting.link && (
                  <button
                    onClick={() => {
                      if (canJoin) {
                        setActiveMeeting(meeting);
                      } else {
                        toast.warning("Meeting can only be joined on the scheduled date during the meeting time.");
                      }
                    }}
                    disabled={!canJoin}
                    className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                      canJoin 
                        ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    title={!canJoin ? "Meeting can only be joined on the scheduled date during the meeting time" : "Join meeting"}
                  >
                    <Video size={18} /> Join
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 🔹 Fullscreen Jitsi Panel with animation */}
      <AnimatePresence>
        {activeMeeting && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative w-full h-full">
              <button
                className="absolute top-4 right-4 z-50 p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700"
                onClick={() => setActiveMeeting(null)}
              >
                <X size={20} />
              </button>

              <JitsiMeetingFrame
                roomName={activeMeeting.link?.split("/").pop() || activeMeeting._id}
                userInfo={{
                  displayName: JSON.parse(sessionStorage.getItem("userData"))?.username,
                }}
                domain="meet.jit.si"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}