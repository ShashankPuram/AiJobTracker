import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useFilterStore } from "../store/useFilterStore";

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI Job Assistant powered by LangGraph. Type a message to ask about filtering jobs or clearing filters!" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const { setTypes, setLocations, clearFilters } = useFilterStore();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const userMsg: Message = { role: 'user', content: inputValue };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    
    // Add typing indicator
    setMessages(prev => [...prev, { role: 'assistant', content: "..." }]);

    try {
      const res = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await res.json();
      
      // Update local chat (replace the "..." placeholder)
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      
      // Affect global store filters!
      if (data.newFilters) {
        if (data.newFilters.types !== undefined) {
          if (data.newFilters.types.length === 0 && (!data.newFilters.locations || data.newFilters.locations.length === 0)) {
            clearFilters();
          } else {
            setTypes(data.newFilters.types);
          }
        }
        if (data.newFilters.locations !== undefined) {
          if (data.newFilters.locations.length > 0) {
            setLocations(data.newFilters.locations);
          }
        }
      }
    } catch(err) {
      console.error(err);
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I lost connection to the server." }]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              Career Copilot
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </h2>
            <p className="text-xs text-primary-600 font-medium">Powered by LangGraph Agent</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 max-w-[85%] ${msg.role === 'assistant' ? '' : 'ml-auto flex-row-reverse'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-700'}`}>
              {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
              msg.role === 'assistant' 
                ? (msg.content === "..." ? "bg-slate-100/50 text-slate-400 animate-pulse" : "bg-slate-100 text-slate-800 rounded-tl-sm")
                : 'bg-primary-600 text-white rounded-tr-sm shadow-md shadow-primary-500/20'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-6 pr-14 text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            placeholder="E.g. Clear my filters, or show me Remote roles..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 p-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
