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
  // Add floating widget state
  const [isOpen, setIsOpen] = useState(true);

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

  // Modern KYC badge logic
  const getKycStatusBadge = () => {
    if (!user) return null;
    let color = 'bg-gray-200 text-gray-700';
    let text = 'Unknown';
    if (user.kyc_status === 'completed') {
      color = 'bg-green-100 text-green-800';
      text = 'KYC Completed';
    } else if (user.kyc_status === 'pending') {
      color = 'bg-yellow-100 text-yellow-800';
      text = 'KYC Pending';
    } else if (user.kyc_status === 'rejected') {
      color = 'bg-red-100 text-red-800';
      text = 'KYC Rejected';
    } else if (user.kyc_status === 'not_started') {
      color = 'bg-gray-100 text-gray-700';
      text = 'KYC Not Started';
    }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ml-2 ${color}`}>
        {text}
      </span>
    );
  };

  // Intercept KYC queries in sendMessage
  const sendMessage = async (messageText = null) => {
    const userMessage = messageText || input.trim();
    if (!userMessage) return;

    // Intercept KYC queries
    if (user && /\bkyc\b|kyc status|verify.*kyc|my kyc/i.test(userMessage)) {
      let kycReply = '';
      if (user.kyc_status === 'completed') {
        kycReply = '✅ Your KYC is completed. You have full access to all banking features.';
      } else if (user.kyc_status === 'pending') {
        kycReply = '⏳ Your KYC is pending. Please wait for verification or contact support.';
      } else if (user.kyc_status === 'rejected') {
        kycReply = '❌ Your KYC was rejected. Please contact support or try again.';
      } else {
        kycReply = '⚠️ You have not started KYC. Please start your KYC to access all features.';
      }
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: kycReply + (user.kyc_status !== 'completed' ? '\n\n👉 ' : '') + (user.kyc_status !== 'completed' ? '<button id="start-kyc-btn" class="bg-blue-600 text-white px-3 py-1 rounded ml-2">Start KYC</button>' : ''),
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
      setInput("");
      setLoading(false);
      playNotificationSound();
      return;
    }

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

  // Modernize bot reply (short, friendly, emoji)
  const modernizeReply = (text) => {
    if (/\bkyc\b|kyc status|verify.*kyc|my kyc/i.test(text)) {
      if (!user) return "Please log in to check your KYC status.";
      if (user.kyc_status === 'completed') return "✅ Your KYC is complete! You have full access.";
      if (user.kyc_status === 'pending') return "⏳ Your KYC is pending. We'll notify you soon!";
      if (user.kyc_status === 'rejected') return "❌ Your KYC was rejected. Please contact support.";
      return "⚠️ You haven't started KYC yet. Tap 'Start KYC' to begin!";
    }
    // Add more modernizations as needed
    return text;
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

  // Replace main render with floating chat widget
  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-full shadow-xl w-16 h-16 flex items-center justify-center text-3xl hover:scale-110 transition-all"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat bot"
        >
          <FaRobot />
        </button>
      )}
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-blue-100 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white">
            <div className="bg-white/30 rounded-full p-2">
              <FaRobot className="text-2xl text-blue-900" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-base">CBI Assistant</div>
              <div className="text-xs text-blue-100">Online</div>
            </div>
            <button className="text-white text-xl hover:text-blue-200" onClick={() => setIsOpen(false)}>&times;</button>
          </div>
          {/* Chat Body */}
          <div className="flex-1 flex flex-col gap-2 px-3 py-2 overflow-y-auto bg-white/60" style={{ maxHeight: 400 }}>
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-4 py-2 mb-1 max-w-[80%] text-sm shadow ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {msg.sender === 'bot' ? modernizeReply(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2 mb-1 bg-gray-100 text-gray-500 text-sm animate-pulse">CBI Assistant is typing...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          {/* Input Bar */}
          <form
            className="flex items-center gap-2 px-3 py-2 bg-white/80 border-t"
            onSubmit={e => { e.preventDefault(); sendMessage(); }}
          >
            <input
              ref={chatInputRef}
              type="text"
              className="flex-1 rounded-xl px-3 py-2 border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none text-sm bg-white"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              autoFocus={isOpen}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 text-xl flex items-center justify-center disabled:opacity-50"
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
}