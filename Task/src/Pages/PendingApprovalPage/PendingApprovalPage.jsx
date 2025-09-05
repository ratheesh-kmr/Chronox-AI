import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  getPendingUsers,
  updateUserStatus,
} from "../../Services/pendingApprovalServices";
import { fetchTeamsPublic } from "../../Services/services";

const PendingApprovalPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [teamsMap, setTeamsMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // fetch pending users
  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (err) {
      console.error("Error fetching pending users:", err);
      setPendingUsers([]);
    }
    setLoading(false);
  };

  // fetch teams and build lookup map
  const fetchTeams = async () => {
    try {
      const teams = await fetchTeamsPublic();
      const teamLookup = {};
      teams.forEach((team) => {
        teamLookup[team._id] = team.teamName;
      });
      setTeamsMap(teamLookup);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const handleApproval = async (userId, approve) => {
    setProcessingId(userId);
    try {
      await updateUserStatus(userId, approve ? 1 : 2);
      setPendingUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Error updating status:", err);
    }
    setProcessingId(null);
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchTeams();
  }, []);

  return (
    // Outer container with responsive padding and background gradient
    <div className="p-4 sm:p-6 md:p-8 lg:p-12 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 min-h-screen w-full">
      <div className="max-w-4xl mx-auto">
        {/* Title with responsive text size */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 border-b-2 border-gray-200 pb-4">
          Pending User Approvals
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-60 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
            <p className="text-lg sm:text-xl text-gray-600 font-medium text-center">
              No users pending approval.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              You are all caught up for now.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingUsers.map((user) => (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                // Responsive layout: column on small screens, row on medium and up
                className="p-6 rounded-2xl shadow-lg bg-white border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-300 hover:shadow-xl"
              >
                {/* Responsive grid for user details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm text-gray-700 w-full mb-4 md:mb-0">
                  <p>
                    <span className="font-semibold text-gray-900">Name:</span>{" "}
                    {user.name}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Email:</span>{" "}
                    {user.email}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Mobile No:
                    </span>{" "}
                    {user.mobileNo}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Role:</span>{" "}
                    {user.role}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Team Name:
                    </span>{" "}
                    {teamsMap[user.team] || "N/A"}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">
                      Joining Date:
                    </span>{" "}
                    {new Date(user.date).toLocaleDateString()}
                  </p>
                </div>

                {/* Responsive button container */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApproval(user._id, true)}
                    disabled={processingId === user._id}
                    className="w-full px-5 py-2 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {processingId === user._id ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Approve
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleApproval(user._id, false)}
                    disabled={processingId === user._id}
                    className="w-full px-5 py-2 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    {processingId === user._id ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    Reject
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingApprovalPage;