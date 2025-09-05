import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateTask, fetchProjects } from "../../../Services/services";
import { useDroppable } from "@dnd-kit/core";

// Column Labels
const COLUMN_TITLES = ["To Do", "In Progress", "Completed"];
const STATUS_MAP = {
  "To Do": "ToDo",
  "In Progress": "InProgress",
  Completed: "Completed",
};

// Color based on priority
const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "border-l-red-500";
    case "Medium":
      return "border-l-yellow-500";
    case "Low":
      return "border-l-blue-500";
    default:
      return "border-l-gray-400";
  }
};

// Droppable column container
function DroppableColumn({ id, children }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100 rounded-lg p-4 shadow-md min-h-[500px] transition-all"
    >
      {children}
    </div>
  );
}

// Sortable task card (now accepts `projects` prop)
function SortableTask({ task, projects }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task._id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto', // Keep the dragged card above others
    opacity: isDragging ? 0.8 : 1,
  };

  const color = getPriorityColor(task.priority);
  // Find project name based on the project ID
  const project = projects.find(p => p._id === task.projectName);
  const projectName = project ? project.projectName : "N/A";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={`bg-white shadow p-3 mb-3 rounded-md border-l-4 ${color} hover:cursor-grab`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 text-base">{task.taskList}</h4>
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${task.priority === "High"
              ? "bg-red-100 text-red-800"
              : task.priority === "Medium"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-blue-100 text-blue-800"
            }`}
        >
          {task.priority || "None"}
        </span>
      </div>
      <p className="text-sm text-gray-800 mb-2">
        {task.description || "No description"}
      </p>

      <div className="text-xs text-gray-600 space-y-1 mt-3 border-t pt-2">
        <div className="flex justify-between items-center">
          <strong>Project:</strong>
          <span className="truncate max-w-[150px]" title={projectName}>
            {projectName}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <strong>End date:</strong>
          <span
            className="truncate max-w-[150px]"
            title={task.taskEndDate ? new Date(task.taskEndDate).toLocaleString() : "No End Date"}
          >
            {task.taskEndDate
              ? new Date(task.taskEndDate).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
              : "N/A"}
          </span>

        </div>
      </div>
    </div>
  );
}

// Main Kanban Board Component
export default function EmployeeKanbanBoard({ tasks, onTaskUpdate }) {
  const [columnsData, setColumnsData] = useState({
    "To Do": [],
    "In Progress": [],
    Completed: [],
  });
  const [activeTask, setActiveTask] = useState(null);
  const [projects, setProjects] = useState([]); // State to hold project data

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    // Correctly fetch projects and group tasks
    const fetchData = async () => {
      try {
        const projectsData = await fetchProjects();
        setProjects(projectsData);

        const grouped = {
          "To Do": [],
          "In Progress": [],
          Completed: [],
        };

        const filteredTasks = tasks.filter((task) => task.status !== "OverDue");

        filteredTasks.forEach((task) => {
          const label =
            task.status === "Completed"
              ? "Completed"
              : task.status === "InProgress"
                ? "In Progress"
                : "To Do";

          grouped[label].push(task);
        });
        setColumnsData(grouped);
      } catch (error) {
        console.error("Failed to fetch projects or group tasks:", error);
      }
    };

    fetchData();
  }, [tasks]);

  const handleDragStart = (event) => {
    const taskId = event.active.id;
    const allTasks = [
      ...columnsData["To Do"],
      ...columnsData["In Progress"],
      ...columnsData["Completed"],
    ];
    const task = allTasks.find((t) => t._id === taskId);
    setActiveTask(task);
  };

  const getColumnByTaskId = (taskId) => {
    return Object.keys(columnsData).find((col) =>
      columnsData[col].some((t) => t._id === taskId)
    );
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const taskId = active.id;
    const sourceColumn = getColumnByTaskId(taskId);

    let destinationColumn = COLUMN_TITLES.find((col) => col === over.id);
    if (!destinationColumn) {
      destinationColumn = getColumnByTaskId(over.id);
    }

    if (!sourceColumn || !destinationColumn || sourceColumn === destinationColumn) return;

    const taskToMove = columnsData[sourceColumn].find((t) => t._id === taskId);

    const updatedColumns = {
      ...columnsData,
      [sourceColumn]: columnsData[sourceColumn].filter((t) => t._id !== taskId),
      [destinationColumn]: [...columnsData[destinationColumn], taskToMove],
    };

    setColumnsData(updatedColumns);

    try {
      await updateTask(taskId, { status: STATUS_MAP[destinationColumn] });
      // Calling onTaskUpdate to trigger a full data refresh from the parent component
      onTaskUpdate();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMN_TITLES.map((col) => (
          <DroppableColumn key={col} id={col}>
            <h3 className="text-lg font-bold text-gray-700 mb-4">{col}</h3>
            <SortableContext items={columnsData[col].map((t) => t._id)} strategy={verticalListSortingStrategy}>
              {columnsData[col]
                .slice()
                .sort((a, b) => {
                  const order = { High: 1, Medium: 2, Low: 3 };
                  return (order[a.priority] || 4) - (order[b.priority] || 4);
                })
                .map((task) => (
                  <SortableTask key={task._id} task={task} projects={projects} />
                ))}
            </SortableContext>
          </DroppableColumn>
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="bg-white shadow p-3 mb-3 rounded-md w-[250px] border-l-4" style={{
            borderColor: getPriorityColor(activeTask.priority).split('-').pop()
          }}>
            <h4 className="font-semibold text-gray-800">{activeTask.taskList}</h4>
            <p className="text-sm text-gray-500">{activeTask.description}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}