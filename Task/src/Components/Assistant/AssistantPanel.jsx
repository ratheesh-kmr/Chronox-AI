import { useState, useRef, useEffect } from "react";
import { Send, Mic, Loader2, ArrowDown, VolumeX, Volume2, Trash2 } from "lucide-react";

const AssistantPanel = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [lastInteractionType, setLastInteractionType] = useState('text'); // 'voice' or 'text'

  const chatWindowRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);

  // Load conversation from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chronox-conversation');
    const savedMuteState = localStorage.getItem('chronox-muted');
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading saved messages:', error);
        // Fallback to default message
        setMessages([{ role: "assistant", content: "👋 Hi, I'm your Chronox. How can I help?" }]);
      }
    } else {
      // Default welcome message for new conversations
      setMessages([{ role: "assistant", content: "👋 Hi, I'm your Chronox. How can I help?" }]);
    }

    if (savedMuteState) {
      setMuted(savedMuteState === 'true');
    }
  }, []);

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chronox-conversation', JSON.stringify(messages));
    }
  }, [messages]);

  // Save mute state to localStorage
  useEffect(() => {
    localStorage.setItem('chronox-muted', muted.toString());
  }, [muted]);

  // Initialize speech recognition once
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setListening(false);
        setInput(transcript);
        setLastInteractionType('voice'); // Mark this as voice interaction
        sendMessage(transcript, 'voice');
      };

      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  // Auto-scroll chat window
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  // Speak assistant responses aloud
  const speak = (text) => {
    if ("speechSynthesis" in window && !muted) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      utteranceRef.current = utterance;
      setSpeaking(true);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const toggleMute = () => {
    if (speaking) {
      stopSpeaking();
    }
    setMuted(!muted);
  };

  const clearConversation = () => {
    const defaultMessage = { role: "assistant", content: "👋 Hi, I'm your Chronox. How can I help?" };
    setMessages([defaultMessage]);
    localStorage.setItem('chronox-conversation', JSON.stringify([defaultMessage]));
  };

  const sendMessage = async (forcedInput = null, interactionType = 'text') => {
    const messageText = forcedInput || input;
    if (!messageText.trim() || loading) return;

    const userMessage = { role: "user", content: messageText };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Update interaction type if not provided
    if (!forcedInput) {
      setLastInteractionType(interactionType);
    }

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const reply = data.reply || "⚠️ No response received.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      // Only speak if the last interaction was voice and not muted
      const shouldSpeak = (interactionType === 'voice' || lastInteractionType === 'voice') && !muted;
      if (shouldSpeak) {
        speak(reply);
      }
    } catch (err) {
      console.error("Error chatting with assistant:", err);
      const errorMessage = { role: "assistant", content: "⚠️ Couldn't reach the assistant." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setLastInteractionType('text'); // Mark this as text interaction
      sendMessage(null, 'text');
    }
  };

  const handleSendClick = () => {
    setLastInteractionType('text'); // Mark this as text interaction
    sendMessage(null, 'text');
  };

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      if (!listening) {
        recognitionRef.current.start();
        setListening(true);
      } else {
        recognitionRef.current.stop();
        setListening(false);
      }
    } else {
      alert("🎤 Your browser doesn't support speech recognition.");
    }
  };

  // Helper function to render messages with formatting (e.g., bold text & user cards)
  const renderMessageContent = (content) => {
    // Detect if the message contains user search results
    if (content.includes("✅ Found") && content.includes("user(s):")) {
      const lines = content.split("\n").filter(line => line.trim());

      // Extract user lines (skip the first 2 lines: intro + "Found X user(s)")
      const userLines = lines.slice(2);

      return (
        <div className="space-y-3">
          <p>{lines[0]}</p>
          <p className="font-semibold text-green-600">{lines[1]}</p>
          {userLines.map((line, index) => {
            const match = line.match(/👤 (.*?) 📧 Email: (.*?) 🏷️ Role: (.*?) 📅 Joined: (.*)/);
            if (!match) return <p key={index}>{line}</p>;

            const [, name, email, role, joined] = match;

            return (
              <div
                key={index}
                className="p-3 rounded-xl border border-gray-200 bg-gray-50 shadow-sm"
              >
                <p className="text-lg font-semibold">👤 {name}</p>
                <p className="text-sm text-gray-600">📧 {email}</p>
                <p className="text-sm">🏷️ {role}</p>
                <p className="text-sm text-gray-500">📅 Joined: {joined}</p>
              </div>
            );
          })}
        </div>
      );
    }

    // Default: bold formatting using ** **
    const parts = content.split('**');
    return parts.map((part, index) =>
      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
    );
  };

  const handleScroll = () => {
    if (chatWindowRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current;
      setShowScrollButton(scrollHeight - scrollTop > clientHeight + 100);
    }
  };

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTo({
        top: chatWindowRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Siri-like animation component
  const SiriAnimation = () => (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
      <div className="relative">
        {/* Outer pulsing circle */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-500 animate-pulse opacity-60"></div>

        {/* Inner animated circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping"></div>
        </div>

        {/* Core circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 shadow-lg">
            <div className="w-full h-full rounded-full bg-white opacity-30 animate-pulse"></div>
          </div>
        </div>

        {/* Sound waves */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-blue-400 opacity-40 animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute w-20 h-20 rounded-full border-2 border-purple-400 opacity-30 animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );

  // Speaking animation component
  const SpeakingAnimation = () => (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
      <div className="relative">
        {/* Base circle */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 opacity-80"></div>

        {/* Sound wave bars */}
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          <div className="w-1 bg-white rounded-full animate-bounce" style={{ height: '8px', animationDelay: '0ms' }}></div>
          <div className="w-1 bg-white rounded-full animate-bounce" style={{ height: '12px', animationDelay: '100ms' }}></div>
          <div className="w-1 bg-white rounded-full animate-bounce" style={{ height: '6px', animationDelay: '200ms' }}></div>
          <div className="w-1 bg-white rounded-full animate-bounce" style={{ height: '10px', animationDelay: '300ms' }}></div>
          <div className="w-1 bg-white rounded-full animate-bounce" style={{ height: '8px', animationDelay: '400ms' }}></div>
        </div>

        {/* Outer glow */}
        <div className="absolute inset-0 w-16 h-16 rounded-full bg-green-300 opacity-20 animate-pulse -top-2 -left-2"></div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full h-[500px] rounded-2xl shadow-xl bg-gray-50 border border-gray-200">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Chronox Assistant</h2>
        <div className="flex items-center gap-2">
          {/* Voice status indicator */}
          {listening && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              Listening...
            </div>
          )}
          {speaking && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Speaking...
            </div>
          )}

          {/* Clear conversation button */}
          <button
            onClick={clearConversation}
            className="p-2 rounded-lg transition-colors duration-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Mute/Unmute button */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg transition-colors duration-200 ${muted
                ? "bg-red-100 text-red-600 hover:bg-red-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            title={muted ? "Unmute assistant" : "Mute assistant"}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chat Window */}
      <div
        ref={chatWindowRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 relative"
        onScroll={handleScroll}
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl max-w-[85%] break-words leading-relaxed shadow-sm ${msg.role === "assistant"
                ? "bg-white text-gray-800 self-start border border-gray-200"
                : "bg-indigo-500 text-white self-end ml-auto"
              }`}
          >
            {renderMessageContent(msg.content)}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-500 italic">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> Thinking...
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 p-2 bg-gray-300 rounded-full shadow-lg hover:bg-gray-400 transition-all duration-200 z-50"
          >
            <ArrowDown className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Input Area with animations */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 flex items-end gap-2 bg-white rounded-b-2xl relative">
        {/* Siri-like animations */}
        {listening && <SiriAnimation />}
        {speaking && <SpeakingAnimation />}

        <textarea
          rows={1}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 rounded-xl resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200 text-gray-700 max-h-36"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          onClick={handleSendClick}
          className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors duration-200"
          disabled={loading || !input.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
        <button
          onClick={handleVoiceInput}
          className={`p-3 rounded-xl transition-all duration-200 transform ${listening
              ? "bg-red-500 text-white hover:bg-red-600 scale-110 shadow-lg"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:scale-105"
            }`}
          title={listening ? "Stop listening" : "Start voice input"}
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default AssistantPanel;