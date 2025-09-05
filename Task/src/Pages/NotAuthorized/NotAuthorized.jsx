import React from 'react';
import { useNavigate } from 'react-router-dom';

const LockClosedIcon = () => (
  <svg className="mx-auto h-20 w-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v3h8z"
    ></path>
  </svg>
);

const NotAuthorized = () => {
  const navigate = useNavigate();
  const userRole = sessionStorage.getItem("role");

  const redirectByRole = {
    EMPLOYEE: '/EmployeeDashboard',
    ADMIN: '/dashboard',
    SUPER_ADMIN: '/dashboard',
    TEAM_LEAD: '/TeamLeadDashboard',
  };

  const handleGoHome = () => {
    const targetRoute = redirectByRole[userRole] || '/NotAuthorized';
    navigate(targetRoute, { replace: true });
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
        <div className="mb-6">
          <LockClosedIcon />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">
          Access Denied
        </h1>
        <p className="text-base text-gray-600 mb-8 leading-relaxed">
          You do not have the necessary permissions to view this page.
          Please log in with an authorized account or contact support if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Go to Home
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotAuthorized;
