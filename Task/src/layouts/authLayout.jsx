import { AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "../Components/Login/Login";
import Register from "../Components/Register/Register";

export default function AuthLayout() {
  const location = useLocation();
  const path = location.pathname;

  const isRegister = path === "/register";

  const leftImage = isRegister
    ? "/Images/register.svg"
    : "/Images/login.svg";

  const leftTitle = isRegister ? "Join Our Team!" : "Welcome Back!";
  const leftText = isRegister
    ? "Create your account and start your journey"
    : "Start your journey with us today";

  return (
    <div className="min-h-screen w-full flex">
      {/* Left: Illustration section */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 p-10 bg-gray-900 text-white">
        <img
          src={leftImage}
          alt="Illustration"
          className="w-full max-w-md drop-shadow-2xl"
        />
        <h1 className="text-4xl font-bold mt-6">{leftTitle}</h1>
        <p className="text-lg text-gray-300 mt-2">{leftText}</p>
      </div>

      {/* Right: Login/Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4  bg-gray-900">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
