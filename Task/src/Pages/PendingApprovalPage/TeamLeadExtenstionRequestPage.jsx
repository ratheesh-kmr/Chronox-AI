import React, { useEffect, useState } from "react";
import { fetchExtensionRequestsByUser, handleTaskExtension } from "../../Services/pendingApprovalServices";
import { CalendarDays, User2, XCircle, Edit3, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import EditTaskModal from "../TaskPage/EditTaskModal";

export default function TeamLeadExtensionRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId")

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchExtensionRequestsByUser(userId);
      setRequests(data);
    } catch (err) {
      toast.error("Failed to load extension requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  
  
  const handleApprove = async (taskId) => {
    try {
      await handleTaskExtension(taskId, "APPROVED");
      toast.success("Request Approved!");
      loadRequests(); // refresh list
    } catch (err) {
      toast.error("Failed to update request");
    }
  };

  const handleEditTask = (task) => {
    // Ensure the task has proper project structure for EditTaskModal
    const taskWithProperFormat = {
      ...task,
      // Make sure project info is in the format EditTaskModal expects
      project: task.projectName?._id || task.project?._id || task.project,
      projectName: task.projectName || task.project,
    };
    
    console.log("Task being passed to modal:", taskWithProperFormat);
    setSelectedTask(taskWithProperFormat);
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = () => {
    // Refresh the requests list after task update
    loadRequests();
    handleModalClose();
  };

  return (
    <div className="p-6 rounded-2xl shadow-xl bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-2 text-black">Extension Requests</h1>
      <h2 className="text-m mb-6 mt-0 text-gray-500">
        Overdue task's Extension request will appear here
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No pending requests</p>
      ) : (
        <div className="space-y-4">
          {requests.map((task) => (
            <div
              key={task._id}
              className="relative bg-white shadow rounded-2xl p-4 border border-gray-200"
            >
              <h2 className="text-lg font-semibold text-indigo-600">
                {task.taskList}
              </h2>
              <p className="text-sm text-gray-600">
                {task.description || "No description"}
              </p>

              <div className="mt-3 text-sm space-y-1">
                <p className="flex items-center">
                  <User2 size={16} className="mr-2 text-gray-500" />
                  Requested By:{" "}
                  <span className="font-medium ml-1">
                    {task.extensionRequest.requestedBy?.name} (
                    {task.extensionRequest.requestedBy?.email})
                  </span>
                </p>
                <p className="flex items-center">
                  <CalendarDays size={16} className="mr-2 text-gray-500" />
                  Current End:{" "}
                  {task.taskEndDate
                    ? format(new Date(task.taskEndDate), "PPP")
                    : "N/A"}
                </p>
                <p className="flex items-center">
                  <CalendarDays size={16} className="mr-2 text-gray-500" />
                  Requested End:{" "}
                  {task.extensionRequest.requestedEndDate
                    ? format(new Date(task.extensionRequest.requestedEndDate), "PPP")
                    : "N/A"}
                </p>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => handleEditTask(task)}
                  className="flex items-center px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  <Edit3 size={16} className="mr-2" /> Edit Task
                </button>
                <button
                  onClick={() => handleReject(task._id)}
                  className="flex items-center px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <XCircle size={16} className="mr-2" /> Reject
                </button>
                 <button
                  onClick={() => handleApprove(task._id)}
                  className="flex items-center px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <Check size={16} className="mr-2" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Task Modal */}
      {editModalOpen && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={handleModalClose}
          onUpdate={handleTaskUpdate}
        />
      )}
    </div>
  );
}