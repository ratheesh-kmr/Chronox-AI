import React, { useEffect, useState } from "react";
import { fetchTeamByLead } from "../../Services/services";
import { User, Mail, Briefcase, Search } from "lucide-react";

// Assuming you have a friendly illustration for when no members are found
const NoMembersIllustration = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
    <svg
      className="w-16 h-16 mb-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0H3z"
      />
    </svg>
    <p className="font-semibold text-lg">No members found</p>
    <p className="text-sm">It looks like your team has no members assigned yet.</p>
  </div>
);

const TeamLeadPage = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const teamLeadId = sessionStorage.getItem("userId");

  useEffect(() => {
    const getTeam = async () => {
      try {
        const data = await fetchTeamByLead(teamLeadId);
        setTeam(data);
      } catch (err) {
        console.error("Error fetching team:", err);
      } finally {
        setLoading(false);
      }
    };
    getTeam();
  }, [teamLeadId]);

  const filteredMembers =
    team?.members.filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading team...</p>;
  if (!team || !team.members || team.members.length === 0) return <NoMembersIllustration />;

  return (
    <div className="p-4 sm:p-6 w-full bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 rounded-xl min-h-screen">
      {/* Team Info Header */}
      <div className="text-left mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{team.teamName}</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {team.teamDescription || "No description provided."}
        </p>
      </div>

      {/* Members Section Header and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Team Members</h2>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search members..."
            className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member._id}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="p-4 sm:p-6">
                {/* Basic Info */}
                <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center mt-1">
                      <Briefcase className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" />
                      {member.role || "No role"}
                    </p>
                  </div>
                </div>
                <p className="flex items-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-pink-500" />
                  {member.email}
                </p>

                {/* Task Stats */}
                {member.tasks && Object.keys(member.tasks).length > 0 && (
                  <div className="mt-3 sm:mt-4 border-t pt-3 sm:pt-4 border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Task Summary</h4>
                    <ul className="space-y-1 sm:space-y-2">
                      {Object.entries(member.tasks).map(([status, count]) => (
                        <li
                          key={status}
                          className="flex justify-between items-center text-xs sm:text-sm text-gray-700"
                        >
                          <span className="flex items-center font-medium">
                            <svg
                              className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {status}
                          </span>
                          <span className="font-bold text-gray-900">{count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NoMembersIllustration />
      )}
    </div>
  );
};

export default TeamLeadPage;