import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTeamById, fetchProjects } from "../../Services/services";
import { ArrowLeft, Crown, Settings } from "lucide-react";
import TeamSettingsModal from "./TeamSettingsModal";
import { IconExternalLink, IconEdit } from "@tabler/icons-react";

const memberColors = [
    { bg: "bg-pink-200", text: "text-pink-800" },
    { bg: "bg-red-200", text: "text-red-800" },
    { bg: "bg-orange-200", text: "text-orange-800" },
    { bg: "bg-yellow-200", text: "text-yellow-800" },
    { bg: "bg-green-200", text: "text-green-800" },
    { bg: "bg-blue-200", text: "text-blue-800" },
    { bg: "bg-indigo-200", text: "text-indigo-800" },
    { bg: "bg-purple-200", text: "text-purple-800" }
];



const statusColors = {
};



export default function TeamDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState(null);
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await getTeamById(id);
                setTeam(res);

                const allProjects = await fetchProjects();
                const assigned = allProjects.filter((p) =>
                    p.teams?.some((t) => t._id === id)
                );
                setProjects(assigned);
                setFilteredProjects(assigned);
            } catch (err) {
                console.error("Failed to fetch team or projects", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleFilterChange = (status) => {
        setStatusFilter(status);
        if (status === "All") {
            setFilteredProjects(projects);
        } else {
            setFilteredProjects(projects.filter((p) => p.status === status));
        }
    };

    const handleEdit = () => setShowSettings(true);

    if (loading) return <div className="p-6">Loading...</div>;
    if (!team) return <div className="p-6">Team not found</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto bg-purple-50 min-h-screen rounded-xl">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center text-purple-600  rounded-xl cursor-pointer"
            >
                <ArrowLeft className="mr-1" size={18} />
                Back to Teams
            </button>

            <div className="bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 p-6 rounded-xl shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{team.teamName}</h1>
                        <p className="text-gray-600 mt-1">{team.teamDescription}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="p-2 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Settings"
                        >
                            <IconEdit size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm text-gray-700">
                    <Info label="Team Lead" value={team.teamLeader?.name} icon={<Crown size={14} className="text-yellow-500" />} />
                    <Info label="Created By" value={team.createdBy?.name} />
                    <Info label="Updated By" value={team.updatedBy?.name} />
                    <div>
                        <span className="font-medium text-gray-800">Members:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {team.members?.length > 0 ? (
                                team.members.map((member, index) => {
                                    const color = memberColors[index % memberColors.length];
                                    return (
                                        <div
                                            key={member._id}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${color.bg} ${color.text}`}
                                        >
                                            <span className="bg-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold border border-gray-300">
                                                {member.name.charAt(0).toUpperCase()}
                                            </span>
                                            {member.name}
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500">No members</p>
                            )}
                        </div>

                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">Assigned Projects</h2>

                    {/* Project Filters */}
                    <div className="mb-4 flex gap-2 flex-wrap">
                        {["All", "Active", "Upcoming", "Completed", "Delayed"].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleFilterChange(status)}
                                className={`px-3 py-1 text-sm rounded-full border ${statusFilter === status
                                    ? "bg-purple-600 text-white"
                                    : "bg-white text-gray-700 border-gray-300"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {filteredProjects.length === 0 ? (
                        <p className="text-gray-500 text-sm">No projects in this category.</p>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {filteredProjects.map((project) => (
                                <div
                                    key={project._id}
                                    onClick={() => navigate(`/ProjectPage/${project._id}`)}
                                    className={`rounded-lg p-4 shadow-md transition cursor-pointer ${statusColors[project.status] || "bg-purple-100"
                                        }`}
                                >
                                    <h3 className="font-medium text-gray-900">{project.projectName}</h3>
                                    <div
                                        className="text-sm text-gray-700 mt-1 line-clamp-2"
                                        dangerouslySetInnerHTML={{ __html: project.description }}
                                    />
                                    <p className="text-xs text-gray-600 mt-2">
                                        Status: <span className="font-medium">{project.status}</span>
                                    </p>
                                    <div className="flex justify-end">
                                        {<IconExternalLink size={20} className="text-black" />}
                                    </div>
                                </div>
                            ))}

                        </div>
                    )}
                </div>
            </div>

            {showSettings && (
                <TeamSettingsModal
                    team={team}
                    onClose={() => setShowSettings(false)}
                    onUpdate={async () => {
                        const updated = await getTeamById(id);
                        setTeam(updated);
                    }}
                />
            )}
        </div>
    );
}

function Info({ label, value, icon = null }) {
    return (
        <div>
            <span className="font-medium text-gray-800">{label}:</span>{" "}
            <span className="flex items-center gap-1 mt-0.5">{icon} {value || "N/A"}</span>
        </div>
    );
}
