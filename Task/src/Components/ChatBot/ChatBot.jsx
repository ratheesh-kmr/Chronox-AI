import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function ChatBot() {
  useEffect(() => {
    if (!document.querySelector('script[src*="dialogflow-console"]')) {
      const script = document.createElement("script");
      script.src = "http://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">AI Chat Support</h1>
      <p className="text-gray-600 mb-6">Ask your questions below. Our assistant is here to help 24/7.</p>

      <df-messenger
        intent="WELCOME"
        chat-title="AiAssistant"
        agent-id="a4db4ad9-511c-43a5-b75c-d85b0b1e1817"
        language-code="en"
      ></df-messenger>

      <Link to="/help" className="text-sm text-primary underline mt-4 inline-block">
        ← Back to Help Page
      </Link>
    </div>
  );
}
