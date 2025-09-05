import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MessageSquare,
  BookOpen,
  LifeBuoy,
} from "lucide-react";

export default function GetHelpPage() {
  const navigate = useNavigate();
  return (
    <div className="p-6 bg-gradient-to-br from-purple-100 via-purple-200 to-pink-100 shadow-lg rounded-2xl min-h-[80vh]">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Get Help & Support</h1>

      <div className="grid gap-6 sm:grid-cols-2 ">
        <div className="p-4  rounded-2xl shadow-sm hover:shadow-md transition bg-white">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <MessageSquare size={20} />
            <h2 className="text-lg font-semibold ">Ask a Question</h2>
          </div>
          <p className="text-gray-600 text-sm mb-2">
            Got a doubt or stuck somewhere? Let us know your issue.
          </p>
          <a href="mailto:support@example.com" className="text-sm text-primary text-blue-500">
            ratheeshkumar.xplore@gmail.com
          </a>
        </div>

        <div className="p-4  rounded-2xl shadow-sm hover:shadow-md transition bg-white">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <Phone size={20} />
            <h2 className="text-lg font-semibold">Call Us</h2>
          </div>
          <p className="text-gray-600 text-sm mb-2">
            Available on weekdays from 10 AM to 6 PM.
          </p>
          <p className="text-sm text-primary text-blue-500">+91-98765-43210</p>
        </div>

        <div className="p-4  rounded-2xl shadow-sm hover:shadow-md transition bg-white">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <BookOpen size={20} />
            <h2 className="text-lg font-semibold">Documentation</h2>
          </div>
          <p className="text-gray-600 text-sm mb-2">
            Learn how to use the system through our help guides.
          </p>
          <Link
            to="/ChronoxWalkthrough"
            className="px-4 py-2 text-sm bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors"
          >
            View Docs
          </Link>
        </div>

      </div>
    </div>
  );
}
