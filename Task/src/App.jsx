import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./Routes/PrivateRoutes/PrivateRoutes.jsx";
import AuthLayout from "./layouts/authLayout.jsx";
import Login from "./Components/Login/Login.jsx";
import Register from "./Components/Register/Register.jsx";
import Dashboard from "./Components/Dashboard/Dashboard.jsx";
import EmployeeDashboard from "./Components/Dashboard/EmployeeDashboard.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import UserPage from "./Pages/UserPage/UserPage.jsx";
import TeamsPage from "./Pages/TeamsPage/TeamsPage.jsx";
import EmployeeTaskPage from "./Pages/TaskPage/EmployeeTask/EmployeeTaskPage.jsx";
import ProjectPage from "./Pages/ProjectPage/ProjectPage.jsx";
import HolidaysPage from "./Pages/HolidaysPage/HolidayPages.jsx";
import ProjectDetails from "./Pages/ProjectPage/projectDetails.jsx";
import TeamDetailsPage from "./Pages/TeamsPage/TeamDetailsPage.jsx";
import NotAuthorized from "./Pages/NotAuthorized/NotAuthorized.jsx";
import ProfileSettingsPage from "./Pages/ProfileSettingsPage/ProfileSettingsPage.jsx";
import TaskPage from "./Pages/TaskPage/TaskPage.jsx";
import TaskDetailsPage from "./Pages/TaskPage/TaskDetailsPage.jsx";
import ActivityLogPage from "./Pages/ActivityPage/ActivityLogPage.jsx";
import GetHelpPage from "./Pages/GetHelpPage/GetHelpPage.jsx";
import ChatBot from "./Components/ChatBot/ChatBot.jsx";
import MilestonesPage from "./Pages/MilestonePage/MilestonesPage.jsx";
import MilestoneHandlerPage from "./Pages/MilestonePage/MilestoneHandlerPage.jsx";
import EmployeeProjectsPage from "./Pages/ProjectPage/Employee/EmployeeProjectsPage.jsx"
import PendingApprovalPage from "./Pages/PendingApprovalPage/PendingApprovalPage.jsx";
import ChronoxWalkthrough from "./Pages/Walkthrough/Walkthrough.jsx";
import ExtensionRequestsPage from "./Pages/PendingApprovalPage/ExtensionRequestsPage.jsx"
import Mail from "./Pages/Mail/Mail.jsx"
import TeamLeadPage from "./Pages/TeamLeadPage/TeamLeadPage.jsx";
import TeamLeadDashboard from "./Components/Dashboard/TeamLeadDashboard.jsx";
import TeamLeadTaskPage from "./Pages/TeamLeadPage/TeamLeadTask/TeamLeadTaskPage.jsx";
import TeamLeadExtensionRequestsPage from "./Pages/PendingApprovalPage/TeamLeadExtenstionRequestPage.jsx";
import TeamLeadProjectsPage from "./Pages/ProjectPage/TeamLead/TeamLeadProjectPage.jsx";
import MeetingsPage from "./Pages/MeetingPage/AdminMeetingPage.jsx";


// Main routes
const MainRoutes = () => {
  const location = useLocation();
  const noSidebarRoutes = ["/login", "/register"];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  const renderWithLayout = (Component) =>
    showSidebar ? (
      <AppLayout>
        <Component />
      </AppLayout>
    ) : (
      <Component />
    );


  const userRole = sessionStorage.getItem("role");


  const defaultRoute =
    userRole === "employee" ? "/EmployeeDashboard" : "/dashboard";
    userRole === "team_lead" ? "/TeamLeadDashboard" : "/dashboard";
    


  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute allowedRoles={["admin", "project_lead", "super_admin"]}>
            {renderWithLayout(Dashboard)}
          </PrivateRoute>
        }
      />
      <Route
        path="/EmployeeDashboard"
        element={
          <PrivateRoute allowedRoles={["employee"]}>
            {renderWithLayout(EmployeeDashboard)}
          </PrivateRoute>
        }
      />
       <Route
        path="/TeamLeadDashboard"
        element={
          <PrivateRoute allowedRoles={["team_lead"]}>
            {renderWithLayout(TeamLeadDashboard)}
          </PrivateRoute>
        }
      />


      <Route
        path="/users"
        element={
          <PrivateRoute allowedRoles={["admin", "project_lead", "super_admin"]}>
            {renderWithLayout(UserPage)}
          </PrivateRoute>
        }
      />
      {/* TEAM ROUTES */}
      <Route
        path="/teams"
        element={
          <PrivateRoute allowedRoles={[ "admin", "project_lead", "super_admin"]}>
            {renderWithLayout(TeamsPage)}
          </PrivateRoute>
        }
      />
      <Route
        path="/teams/:id"
        element={
          <PrivateRoute allowedRoles={["team_lead", "admin", "project_lead", "super_admin"]}>
            {renderWithLayout(TeamDetailsPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/TasksPage"
        element={
          <PrivateRoute allowedRoles={["employee", "admin", "project_lead", "super_admin","team_lead"]}>
            {renderWithLayout(TaskPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/TaskDetailsPage/:id"
        element={
          <PrivateRoute allowedRoles={["employee", "admin", "project_lead", "super_admin","team_lead"]}>
            {renderWithLayout(TaskDetailsPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/EmployeeTaskPage"
        element={
          <PrivateRoute allowedRoles={["employee", "super_admin", "admin"]}>
            {renderWithLayout(EmployeeTaskPage)}
          </PrivateRoute>
        }
      />

       <Route
        path="/TeamLeadTaskPage"
        element={
          <PrivateRoute allowedRoles={["super_admin", "admin","team_lead"]}>
            {renderWithLayout(TeamLeadTaskPage)}
          </PrivateRoute>
        }
      />

       <Route
        path="/TeamLeadPage"
        element={
          <PrivateRoute allowedRoles={["team_lead",]}>
            {renderWithLayout(TeamLeadPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/ProjectPage"
        element={
          <PrivateRoute allowedRoles={["admin", "project_lead", "super_admin"]}>
            {renderWithLayout(ProjectPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/MilestonesPage/:projectId"
        element={
          <PrivateRoute allowedRoles={["admin", "project_lead", "super_admin","team_lead"]}>
            {renderWithLayout(MilestonesPage)}
          </PrivateRoute>
        }
      />
      <Route
        path="/MilestoneHandlerPage"
        element={
          <PrivateRoute allowedRoles={["admin", "project_lead", "super_admin"]}>
            {renderWithLayout(MilestoneHandlerPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/MeetingsPage"
        element={
          <PrivateRoute allowedRoles={["admin", "project_lead", "super_admin"]}>
            {renderWithLayout(MeetingsPage)}
          </PrivateRoute>
        }
      />


      <Route
        path="/ProjectPage/:projectId"
        element={
          <PrivateRoute allowedRoles={["admin", "project_lead", "super_admin","team_lead"]}>
            {renderWithLayout(ProjectDetails)}
          </PrivateRoute>
        }
      />

      <Route
        path="/EmployeeProjectsPage"
        element={
          <PrivateRoute allowedRoles={[ "super_admin", "admin","employee","team_lead"]}>
            {renderWithLayout(EmployeeProjectsPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/TeamLeadProjectsPage"
        element={
          <PrivateRoute allowedRoles={[ "super_admin", "admin","team_lead"]}>
            {renderWithLayout(TeamLeadProjectsPage)}
          </PrivateRoute>
        }
      />



      <Route
        path="/activity-log"
        element={
          <PrivateRoute allowedRoles={["admin", "project_lead", "super_admin"]}>
            {renderWithLayout(ActivityLogPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/HolidaysPage"
        element={
          <PrivateRoute allowedRoles={["admin", "project_lead", "super_admin", "employee","team_lead"]}>
            {renderWithLayout(HolidaysPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/ProfileSettingsPage"
        element={
          <PrivateRoute allowedRoles={["team_lead", "admin", "project_lead", "super_admin", "employee"]}>
            {renderWithLayout(ProfileSettingsPage)}
          </PrivateRoute>
        }
      />
      <Route
        path="/GetHelpPage"
        element={
          <PrivateRoute allowedRoles={["team_lead", "admin", "project_lead", "super_admin", "employee"]}>
            {renderWithLayout(GetHelpPage)}
          </PrivateRoute>
        }
      />
      <Route
        path="/Mail"
        element={
          <PrivateRoute allowedRoles={["team_lead", "admin", "project_lead", "super_admin", "employee"]}>
            {renderWithLayout(Mail)}
          </PrivateRoute>
        }
      />

      <Route
        path="/ChronoxWalkthrough"
        element={
          <PrivateRoute allowedRoles={["team_lead", "admin", "project_lead", "super_admin", "employee"]}>
            {renderWithLayout(ChronoxWalkthrough)}
          </PrivateRoute>
        }
      />

      <Route
        path="/PendingApprovalPage"
        element={
          <PrivateRoute allowedRoles={["admin", "super_admin"]}>
            {renderWithLayout(PendingApprovalPage)}
          </PrivateRoute>
        }
      />

      <Route
        path="/ExtensionRequestsPage"
        element={
          <PrivateRoute allowedRoles={["admin", "super_admin","team_lead"]}>
            {renderWithLayout(ExtensionRequestsPage)}
          </PrivateRoute>
        }
      />


      <Route
        path="/TeamLeadExtensionRequestsPage"
        element={
          <PrivateRoute allowedRoles={["admin", "super_admin","team_lead"]}>
            {renderWithLayout(TeamLeadExtensionRequestsPage)}
          </PrivateRoute>
        }
      />


      {/* Unauthorized Fallback */}
      <Route
        path="/NotAuthorized"
        element={<NotAuthorized />}
      />

      <Route
        path="/ChatBot"
        element={renderWithLayout(ChatBot)}
      />

      {/* Default fallback */}
      <Route path="*" element={<Navigate to={defaultRoute} />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <MainRoutes />
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Router>
  );
}

export default App;
