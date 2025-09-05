import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMilestonesByProject, createMilestone, fetchProjectTasks, updateMilestone } from "../../Services/services";
import { Button } from "../../Components/UI/Button/Button";
import { Pencil, PlusCircle, Edit, ArrowRightSquare, Plus } from "lucide-react";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import CreateTaskModal from "../../Pages/TaskPage/CreateTaskModal";

const MilestoneSection = ({ projectId }) => {
    const [milestones, setMilestones] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", startDate: "", endDate: "", task: [] });
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editMilestoneId, setEditMilestoneId] = useState(null);
    const [showCreateTaskModal, setShowCreateTaskModal] = useState(false); // New state for task modal

    const loadData = async () => {
        try {
            const milestoneRes = await fetchMilestonesByProject(projectId);
            const sortedMilestones = (milestoneRes.milestones || []).sort(
                (a, b) => new Date(a.startDate) - new Date(b.startDate)
            );
            setMilestones(sortedMilestones);

            const taskRes = await fetchProjectTasks(projectId);
            setTasks(taskRes || []);
        } catch (error) {
            console.error("Error loading milestones or tasks:", error);
        }
    };

    useEffect(() => {
        if (projectId) loadData();
    }, [projectId]);

    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!form.name) newErrors.name = "Milestone name is required.";
        if (!form.startDate) newErrors.startDate = "Start date is required.";
        if (!form.endDate) newErrors.endDate = "End date is required.";
        if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate))
            newErrors.endDate = "End date cannot be before start date.";
        if (form.task.length === 0) newErrors.task = "At least one task must be selected.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateOrUpdate = async () => {
        if (!validateForm()) return;

        const payload = {
            ...form,
            project: projectId,
            task: form.task.map((t) => t.value),
        };

        try {
            if (isEditing) {
                await updateMilestone(editMilestoneId, payload);
                toast.success("Milestone updated successfully");
            } else {
                await createMilestone(payload);
                toast.success("Milestone created successfully");
            }

            setForm({ name: "", startDate: "", endDate: "", task: [] });
            setIsEditing(false);
            setEditMilestoneId(null);
            setShowForm(false);
            await loadData();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save milestone");
        }
    };

    // Handler for when a new task is created
    const handleTaskCreated = async () => {
        // Reload tasks after a new task is created
        await loadData();
        toast.success("Task created successfully! You can now add it to your milestone.");
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const getStatusStyle = (status) => {
        switch (status) {
            case "Completed":
                return "bg-green-500";
            case "In Progress":
                return "bg-indigo-500";
            case "Pending":
            default:
                return "bg-yellow-500 animate-pulse";
        }
    };

    const getStatusText = (status, start, end) => {
        switch (status) {
            case "Completed":
                return `Completed on ${formatDate(end)}`;
            case "In Progress":
                return `In progress – ends ${formatDate(end)}`;
            case "Pending":
                return `Planned – starts ${formatDate(start)}`;
            case "Delayed":
                return `Delayed – since ${formatDate(end)}`;
            default:
                return "";
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
                <Button onClick={() => setShowForm((prev) => !prev)} size="sm">
                    {isEditing ? (
                        <div className="flex items-center gap-1 text-white font-semibold cursor-pointer">
                            <Pencil size={18} /> Edit Milestone
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-white font-semibold cursor-pointer">
                            <PlusCircle size={18} />Create Milestone
                        </div>
                    )}
                </Button>

                <Button
                    size="m"
                    variant="outline"
                    onClick={() => navigate(`/MilestonesPage/${projectId}`)}
                    title="Go to Milestones Page"
                    className="hover:bg-purple-100 cursor-pointer"
                >
                    <ArrowRightSquare className="text-purple-600" size={18} /> 
                </Button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateOrUpdate();
                        }}
                        className="bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 rounded-lg shadow-md space-y-4 mb-6 border border-purple-200"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Milestone Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter milestone name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-400"
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-400"
                                    />
                                    {errors.startDate && <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                        className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-purple-400"
                                    />
                                    {errors.endDate && <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Select Tasks <span className="text-red-500">*</span>
                                </label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setShowCreateTaskModal(true)}
                                    className="flex items-center gap-1 text-purple-600 border-purple-300 hover:bg-purple-50"
                                >
                                    <Plus size={16} />
                                    Create Task
                                </Button>
                            </div>
                            <Select
                                isMulti
                                options={tasks.map((task) => ({ label: task.taskList, value: task._id }))}
                                value={form.task}
                                onChange={(selected) => setForm({ ...form, task: selected })}
                                className="text-sm"
                                placeholder="Select tasks for this milestone..."
                                noOptionsMessage={() => "No tasks available. Create a task first!"}
                            />
                            {errors.task && <p className="text-xs text-red-500 mt-1">{errors.task}</p>}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                onClick={() => {
                                    setForm({ name: "", startDate: "", endDate: "", task: [] });
                                    setIsEditing(false);
                                    setEditMilestoneId(null);
                                    setShowForm(false);
                                    setErrors({});
                                }}
                                variant="ghost"
                                className="hover:text-red-500"
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-xl">
                                {isEditing ? "Update Milestone" : "Create Milestone"}
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            <div className="p-4 rounded-xl shadow-sm bg-purple-50 pl-2">
                <h3 className="font-semibold mb-4 text-purple-700 flex items-center gap-2">Milestones</h3>
                <div className="border-l-4 border-purple-300 pl-4 relative space-y-6">
                    {milestones.length === 0 ? (
                        <p className="text-sm text-gray-500">No milestones created yet.</p>
                    ) : (
                        milestones.map((ms) => (
                            <div key={ms._id} className="relative group">
                                <div
                                    className={`absolute -left-[10px] top-1.5 w-3 h-3 rounded-full group-hover:scale-125 transition-transform ${getStatusStyle(ms.status)}`}
                                />
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800 pl-2">{ms.name}</p>
                                        <p className="text-xs text-gray-500">{getStatusText(ms.status, ms.startDate, ms.endDate)}</p>
                                        {ms.task?.length > 0 && (
                                            <ul className="ml-2 mt-1 text-sm text-gray-600 list-disc pl-4 space-y-0.5">
                                                {ms.task.map((t) => (
                                                    <li key={t._id}>
                                                        <span className="font-medium">{t.taskList}</span> –{" "}
                                                        <span className="text-xs italic">{t.status}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        className=" text-purple-700 "
                                        onClick={() => {
                                            setForm({
                                                name: ms.name,
                                                startDate: ms.startDate.slice(0, 10),
                                                endDate: ms.endDate.slice(0, 10),
                                                task: ms.task.map((t) => ({ label: t.taskList, value: t._id })),
                                            });
                                            setIsEditing(true);
                                            setEditMilestoneId(ms._id);
                                            setShowForm(true);
                                        }}
                                    >
                                        <Edit size={16} className="mr-1" />
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            {showCreateTaskModal && (
                <CreateTaskModal
                    onClose={() => setShowCreateTaskModal(false)}
                    onTaskCreated={handleTaskCreated}
                />
            )}
        </div>
    );
};

export default MilestoneSection;