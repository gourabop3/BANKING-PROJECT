"use client";
import { useState, useRef, useEffect } from "react";
import { axiosClient } from "@/utils/AxiosClient";
import { toast } from "react-toastify";
import {
  AiOutlineSend,
  AiOutlineUser
} from "react-icons/ai";
import {
  MdSupportAgent,
  MdHelp,
  MdAccountBalance,
  MdCreditCard,
  MdPhoneAndroid,
  MdTransferWithinAStation
} from "react-icons/md";
import { 
  FaRobot, 
  FaUser, 
  FaVolumeUp,
  FaVolumeMute,
  FaPaperPlane
} from "react-icons/fa";
import HeaderName from "@/components/HeaderName";
import { useMainContext } from "@/context/MainContext";

export default function CustomerServicePage() {
  const { user } = useMainContext(); // Get user context
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: user 
        ? `👋 Hello ${user.fullName || 'there'}! I'm CBI Assistant, your intelligent banking chatbot created by Gourab. I'm here to provide you personalized 24/7 banking support.\n\n👨‍💻 Developer: Gourab | Email: gourabmop@gmail.com | Mobile: +91 9263839602 | West Bengal, India\n\nI can assist you with account balance, money transfers, ATM cards, mobile recharge, KYC verification, and much more. How can I help you today?`
        : "👋 Hello! I'm CBI Assistant, your intelligent banking chatbot created by Gourab. I'm here to help you 24/7 with all your banking needs.\n\n👨‍💻 Developer: Gourab | Email: gourabmop@gmail.com | Mobile: +91 9263839602 | West Bengal, India\n\nI can assist you with account balance, money transfers, ATM cards, mobile recharge, KYC verification, and much more. How can I help you today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const bottomRef = useRef(null);
  const chatInputRef = useRef(null);

  // Quick reply suggestions based on user authentication
  const quickReplies = user ? [
    "Check my account balance",
    "How to transfer money?",
    "My ATM card services", 
    "Mobile recharge",
    "My KYC status",
    "Contact developer"
  ] : [
    "How does banking work?",
    "What services do you offer?",
    "How to open an account?",
    "ATM card information",
    "About CBI Bank",
    "Contact developer"
  ];

  const quickActions = [
    { text: "Check Account Balance", icon: MdAccountBalance },
    { text: "Transfer Money", icon: MdTransferWithinAStation },
    { text: "ATM Card Help", icon: MdCreditCard },
    { text: "Mobile Recharge", icon: MdPhoneAndroid },
    { text: "KYC Verification", icon: MdHelp },
    { text: "Developer Details", icon: AiOutlineUser },
    { text: "Customer Support", icon: MdSupportAgent }
  ];

  // Play notification sound
  const playNotificationSound = () => {
    if (isSoundEnabled) {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYbBSV2x/DDeSYBIWS+7diJNggOdLDm8KdhGgU9k9n1unAcBSDUj+3xvmcaBSdyyO/Ack0CCGe+5+OXRQwNVKnn7q5WFApDnN/0v2EcBSJ2yO/Ack0CCGe+5+OXRQwNVKnn7a5WFApDnN/0wGIbBSN2yO7AecgQCUqjzeu5YS8EM47U8MV4JgEcYrvs37pkHAU8ldjzw34vAiRuwOjaqVQNCU+o3+2wXggHU6jcyqpKFgtBmt3zw2IcBSl0yO7AeSYEG0q25d6sZRsEPpfW8sZ+JgEjdMfrp1kPC0ml3OioWAwGWKfdyp1BGAsGWKXc1LJjFghNod3twmYcBSdzzO7BciUELIHO8tiJOQcZZ7zq55hMEAxSpuPwtmMcBjiS1/LNeSsFJHfH8N2QQAoUXrTp66hVFApGnt/0wGEcBSRwx+7NeCkEBUmq5OWaSRQJUaXe765DaFQCBSdzyO/BciUELIHO8tiJOQcZZ7zq55hMEAxSpe'); 
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if audio can't play
    }
  };

  const sendMessage = async (messageText = null) => {
    const userMessage = messageText || input.trim();
    if (!userMessage) return;

    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: userMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setLoading(true);

    try {
      // Use authenticated endpoint if user is logged in, otherwise use public endpoint
      const endpoint = user ? '/support/chat' : '/support/chat/public';
      const requestConfig = user 
        ? {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          }
        : {};
      
      const response = await axiosClient.post(endpoint, {
        message: userMessage
      }, requestConfig);

      // simulate typing delay
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            text: response.data.reply,
            timestamp: new Date().toLocaleTimeString()
          }
        ]);
        setLoading(false);
        playNotificationSound();
      }, 1000);
    } catch (err) {
      toast.error(
        err.response?.data?.msg || "Connection error. Please try again."
      );
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment or contact our support team.",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setLoading(false);
    }
  };

  // Handle quick reply
  const handleQuickReply = (reply) => {
    sendMessage(reply);
  };

  /* auto-scroll on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when component loads
  useEffect(() => {
    chatInputRef.current?.focus();
  }, []);

  const onKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container py-6 md:py-10 px-4 md:px-6">
        <HeaderName />

        {/* -------- Quick Actions -------- */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => sendMessage(action.text)}
                  className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Icon className="text-xl" />
                  <span className="text-xs font-medium text-center">
                    {action.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* -------- Chat Container -------- */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative bg-white bg-opacity-20 p-2 rounded-lg">
                  <FaRobot className="text-white text-xl" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">CBI Assistant - Live Chat Support</h3>
                  <p className="text-blue-100 text-sm">
                    {user 
                      ? `Hello ${user.fullName?.split(' ')[0] || 'User'} • Created by Gourab • Online`
                      : 'Created by Gourab • Online'
                    }
                  </p>
                  <p className="text-blue-200 text-xs">
                    📧 gourabmop@gmail.com • 📱 +91 9263839602 • 📍 West Bengal, India
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={isSoundEnabled ? "Disable sound" : "Enable sound"}
                >
                  {isSoundEnabled ? <FaVolumeUp className="text-white text-sm" /> : <FaVolumeMute className="text-white text-sm" />}
                </button>
              </div>
            </div>
          </div>

          {/* Chat Body */}
              {/* Messages */}
              <div className="h-96 overflow-y-auto bg-gray-50 p-6 space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${
                      m.sender === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        m.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      }`}
                    >
                      {m.sender === "user" ? (
                        <FaUser className="text-xs" />
                      ) : (
                        <FaRobot className="text-xs" />
                      )}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-md ${
                        m.sender === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl shadow-sm ${
                          m.sender === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {m.text}
                        </p>
                      </div>
                      <p
                        className={`text-xs mt-1 ${
                          m.sender === "user" ? "text-gray-500 text-right" : "text-gray-500 text-left"
                        }`}
                      >
                        {m.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center">
                      <FaRobot className="text-xs" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-none border border-gray-200 px-4 py-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Quick Replies */}
              {messages.length <= 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-white">
                  <p className="text-sm text-gray-600 mb-3 font-medium">Quick questions for you:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickReply(reply)}
                        className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-all duration-200 border border-blue-200 transform hover:scale-105"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={chatInputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder="Type your banking question here..."
                    className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{ maxHeight: "100px" }}
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    <FaPaperPlane className="text-lg" />
                  </button>
                </div>
                
                {/* Action Info */}
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>Press Enter to send • {user ? 'Authenticated chat' : 'Public chat'}</span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                    AI Assistant Online
                  </span>
                </div>
              </div>

          {/* Chat Footer with Developer Info */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
            <div className="text-center">
              <p className="text-xs text-gray-600">
                🤖 CBI Assistant - Developed with ❤️ by{" "}
                <span className="font-semibold text-blue-600">Gourab</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                For technical support: gourabmop@gmail.com | +91 9263839602 | West Bengal, India
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}