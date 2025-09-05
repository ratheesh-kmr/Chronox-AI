import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  FolderOpen,
  ClipboardList,
  Repeat,
  Flag,
  BarChart3,
  Bell,
  CheckCircle2,
  CalendarCheck2,
  MessageSquareText,
  FileText,
  ArrowRight,
} from "lucide-react";

const PALETTE = {
  primary: "#8F87F1",
  secondary: "#C68EFD",
  accent: "#E9A5F1",
  soft: "#FED2E2",
};

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, when: "beforeChildren" },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const StepCard = ({ index, icon: Icon, title, children }) => (
  <motion.li
    variants={cardVariants}
    className="relative rounded-2xl p-5 bg-white/80 backdrop-blur border border-white/40 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start gap-4">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-2xl shrink-0"
        style={{
          background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.secondary})`,
        }}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: PALETTE.primary }}
            aria-label={`Step ${index}`}
          >
            {index}
          </span>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="mt-2 text-sm text-gray-600 leading-relaxed">{children}</div>
      </div>
    </div>
  </motion.li>
);

function RolePill({ role }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border"
      style={{
        backgroundColor: `${PALETTE.soft}80`,
        borderColor: PALETTE.accent,
        color: "#693C72",
      }}
    >
      <ShieldCheck className="h-3.5 w-3.5" /> {role}
    </span>
  );
}

export default function ChronoxWalkthrough({ showRoleSwitcher = false }) {
  // always pull from sessionStorage
  const [role, setRole] = useState(() =>
    (sessionStorage.getItem("role") || "EMPLOYEE").toUpperCase()
  );

  useEffect(() => {
    const storedRole = sessionStorage.getItem("role");
    if (storedRole) setRole(storedRole.toUpperCase());
  }, []);

  const isAdmin = useMemo(
    () => ["ADMIN", "PROJECT_LEAD", "SUPER_ADMIN"].includes(role),
    [role]
  );
  const isEmployee = useMemo(
    () => role === "EMPLOYEE" || role === "TEAM_LEAD",
    [role]
  );

  // steps array remains the same...
  const adminSteps = [
    {
      title: "Land on your Dashboard",
      icon: FolderOpen,
      content: (
        <>
          After sign-in, admins, project leads, and super admins are redirected to the <strong>Dashboard</strong> where you’ll see KPIs, active projects, and quick actions.
        </>
      ),
    },
    {
      title: "Create Teams & Assign Team Leads",
      icon: Users,
      content: (
        <>
          Go to <strong>Teams</strong> → <em>Create Team</em>. Add members and set a <strong>TEAM_LEAD</strong>. Deleting a team auto-clears members’ team links.
        </>
      ),
    },
    {
      title: "Create Projects & Add Members",
      icon: ClipboardList,
      content: (
        <>
          Head to <strong>Projects</strong> → <em>New Project</em>. Add description, dates, and attach members. Clicking a project opens a <strong>Project Details</strong> dashboard with milestones, tasks, and people.
        </>
      ),
    },
    {
      title: "Create Tasks (Individual or Project)",
      icon: FileText,
      content: (
        <>
          Use <strong>Create Task</strong>. Toggle between <em>Task for Individual</em> and <em>Task for Project</em>. Required fields: task name, assignee, start & end dates, status. Advanced options include <strong>priority</strong>, <strong>recurrence</strong>, and <strong>duration</strong>.
        </>
      ),
    },
    {
      title: "Set Recurrence (Mon–Sat only)",
      icon: Repeat,
      content: (
        <>
          When recurrence is enabled, CHRONOX generates the next task only <strong>after the task end date</strong>, skipping Sundays automatically. This keeps schedules realistic and focused.
        </>
      ),
    },
    {
      title: "Build Milestones",
      icon: Flag,
      content: (
        <>
          In <strong>Project Details</strong>, create a <strong>Milestone</strong> by grouping relevant tasks. A milestone is completed when <em>all</em> its tasks are marked <strong>Completed</strong>.
        </>
      ),
    },
    {
      title: "Monitor Analytics & Progress",
      icon: BarChart3,
      content: (
        <>
          Use <strong>Analytics</strong> to view task completion trends per project and member. The Project Analytics widget can filter by project and show daily completions.
        </>
      ),
    },
    {
      title: "Review Logs & Notifications",
      icon: Bell,
      content: (
        <>
          The <strong>Logs</strong> page lists system actions with resolved usernames. Cron jobs mark overdue tasks and create recurrence on schedule (excluding Sundays).
        </>
      ),
    },
    {
      title: "Wrap Up",
      icon: CheckCircle2,
      content: (
        <>
          Keep teams aligned by regularly reviewing dashboards, milestones, and overdue items. Iterate on task priorities and timelines as needed.
        </>
      ),
    },
  ];

  const employeeSteps = [
    {
      title: "Land on Task Progress",
      icon: CalendarCheck2,
      content: (
        <>
          After sign-in, <strong>EMPLOYEE</strong> users are redirected to <strong> dashboard</strong> to see what’s due today and what’s next.
        </>
      ),
    },
    {
      title: "Review Assigned Work",
      icon: ClipboardList,
      content: (
        <>
          Check your assigned tasks, due dates, and priorities. Tasks recur only after their end date and never start on Sundays.
        </>
      ),
    },

    {
      title: "Update Status & Work Notes",
      icon: FileText,
      content: (
        <>
          Move tasks through <em>Upcoming → ToDo → InProgress → Completed in the kanban board mode</em>. Add descriptions to keep context.
        </>
      ),
    },
    {
      title: "Overdue Requests ",
      icon: MessageSquareText,
      content: (
        <>
          If the task is marked as Overdue , The <strong>calender</strong> icon on the top right corner of the tasks in the Task grid view helps to add a extention request to the task creator ,  you can view the status of the extension request in notification or Task table view
        </>
      ),
    },
    {
      title: "View you progress",
      icon: Flag,
      content: (
        <>
          To view your progress you can see the dashboard for the perfomance metrics that helps to evaluate yourself
        </>
      ),
    },
    {
      title: "Finish Strong",
      icon: CheckCircle2,
      content: (
        <>
          Mark tasks <strong>Completed</strong> when done. Overdue items are flagged automatically—tackle them first.
        </>
      ),
    },

  ];

  const steps = isAdmin ? adminSteps : employeeSteps;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div
        className="rounded-3xl p-6 md:p-8 mb-6 text-white shadow"
        style={{
          background: `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.secondary})`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">CHRONOX Walkthrough</h1>
            <p className="mt-1 text-white/90 max-w-2xl">
              A step-by-step guide tailored to your role to get up and running quickly.
            </p>
          </div>

          {/* Optional role switcher for demos */}
          {showRoleSwitcher && (
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-2">
              <button
                onClick={() => {
                  sessionStorage.setItem("role", "ADMIN");
                  setRole("ADMIN");
                }}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${isAdmin
                  ? "bg-white text-gray-900"
                  : "text-white/90 hover:bg-white/20"
                  }`}
                aria-pressed={isAdmin}
              >
                ADMIN
              </button>
              <button
                onClick={() => {
                  sessionStorage.setItem("role", "EMPLOYEE");
                  setRole("EMPLOYEE");
                }}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${isEmployee && role === "EMPLOYEE"
                  ? "bg-white text-gray-900"
                  : "text-white/90 hover:bg-white/20"
                  }`}
                aria-pressed={isEmployee && role === "EMPLOYEE"}
              >
                EMPLOYEE
              </button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <RolePill role={isAdmin ? "ADMIN VIEW" : "EMPLOYEE VIEW"} />
        </div>
      </div>

      {/* Body */}
      <motion.ol
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {steps.map((s, i) => (
          <StepCard key={s.title} index={i + 1} icon={s.icon} title={s.title}>
            {s.content}
          </StepCard>
        ))}
      </motion.ol>

      {/* Helpful footer */}
      <div className="mt-8 rounded-2xl border border-dashed p-5 text-sm bg-white">
        <div className="flex items-start gap-3">
          <ArrowRight className="h-5 w-5" style={{ color: PALETTE.primary }} />
          <p className="text-gray-700">
            Your walkthrough is automatically personalized based on the role stored in{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">sessionStorage</code>.
          </p>
        </div>
      </div>

      {/* Accessibility note */}
      <p className="mt-4 text-xs text-gray-500">
        All steps use clear headings, labeled icons, and ARIA states for toggles to support assistive tech.
      </p>
    </div>
  );
}
