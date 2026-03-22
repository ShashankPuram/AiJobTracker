import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, User, MessageCircle, Sparkles } from 'lucide-react';
import { useFilterStore } from '../store/useFilterStore';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi there 👋 What are you looking for?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const filterStore = useFilterStore();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Build current filter state safely
      const currentFilters = {
        title: filterStore.title,
        skills: filterStore.skills,
        datePosted: filterStore.datePosted,
        scoreMin: filterStore.scoreMin,
        scoreMax: filterStore.scoreMax,
        selectedTypes: filterStore.selectedTypes,
        selectedLocations: filterStore.selectedLocations,
        city: filterStore.city
      };

      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           messages: newMessages,
           currentFilters
        })
      });

      const data = await res.json();
      
      if (data.message) {
         setMessages([...newMessages, { role: 'assistant', content: data.message }]);
      } else if (data.error) {
         setMessages([...newMessages, { role: 'assistant', content: `Sorry, there was an error: ${data.error}` }]);
      }

      // Automatically execute UI filter directives driven by the LLM
      if (data.filterActions) {
         const fa = data.filterActions;
         if (fa.clearAll) {
            filterStore.clearFilters();
         } else {
            if (fa.title != null) filterStore.setTitle(fa.title);
            if (fa.skills != null) filterStore.setSkills(fa.skills);
            if (fa.datePosted != null) filterStore.setDatePosted(fa.datePosted);
            if (fa.scoreMin != null) filterStore.setScoreMin(fa.scoreMin);
            if (fa.scoreMax != null) filterStore.setScoreMax(fa.scoreMax);
            if (fa.selectedTypes != null) filterStore.setTypes(fa.selectedTypes);
            if (fa.selectedLocations != null) filterStore.setLocations(fa.selectedLocations);
            if (fa.city != null) filterStore.setCity(fa.city);
         }
      }
    } catch (e) {
      console.error(e);
      setMessages([...newMessages, { role: 'assistant', content: "Oops! Connection failed. Is the AI server running?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Bubble Toggle */}
      {!isOpen && (
         <button 
           onClick={() => setIsOpen(true)}
           className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white rounded-full shadow-[0_4px_20px_rgba(239,68,68,0.4)] flex items-center justify-center transition-all hover:scale-105 z-50 hover:shadow-[0_4px_25px_rgba(239,68,68,0.6)] animate-pulse-soft"
         >
           <MessageCircle className="w-7 h-7 drop-shadow-sm" />
         </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
         <div className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-[#121212] rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#1F1F1F] flex flex-col z-50 animate-slide-up overflow-hidden text-white">
           
           {/* Header */}
           <div className="bg-[#1A1A1A] p-4 flex justify-between items-center text-white shrink-0 shadow-sm border-b border-[#1F1F1F]">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-[#EF4444]/10 rounded-[10px] flex items-center justify-center backdrop-blur-md shadow-inner border border-[#EF4444]/20">
                 <Sparkles className="w-5 h-5 text-[#EF4444]" />
               </div>
               <div>
                 <h3 className="font-bold text-[16px] tracking-tight text-white drop-shadow-sm">AI Assistant</h3>
                 <p className="text-[12px] font-medium text-[#A1A1AA]">Active natural language agent</p>
               </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-[#2A2A2A] rounded-xl transition-colors">
               <X className="w-5 h-5 text-[#6B7280] hover:text-[#EF4444]" />
             </button>
           </div>

           {/* Chat History */}
           <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#0B0B0B] custom-scrollbar">
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`} style={{animationDelay: '50ms'}}>
                 <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${msg.role === 'user' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#121212] border border-[#1F1F1F] text-white'}`}>
                   {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                 </div>
                 <div className={`max-w-[75%] rounded-[16px] p-3.5 text-[14px] font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#EF4444]/10 text-white rounded-tr-sm border border-[#EF4444]/20' : 'bg-[#121212] border border-[#1F1F1F] text-[#A1A1AA] rounded-tl-sm'}`}>
                   {msg.content}
                 </div>
               </div>
             ))}
             {loading && (
               <div className="flex gap-3">
                 <div className="shrink-0 w-8 h-8 rounded-full bg-[#121212] border border-[#1F1F1F] text-[#EF4444] flex items-center justify-center shadow-sm">
                   <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl rounded-tl-none p-3 px-4 shadow-sm flex items-center gap-1.5 h-[44px]">
                   <span className="w-2 h-2 rounded-full bg-[#6B7280] animate-bounce" style={{ animationDelay: '0ms' }} />
                   <span className="w-2 h-2 rounded-full bg-[#6B7280] animate-bounce" style={{ animationDelay: '150ms' }} />
                   <span className="w-2 h-2 rounded-full bg-[#6B7280] animate-bounce" style={{ animationDelay: '300ms' }} />
                 </div>
               </div>
             )}
             <div ref={chatBottomRef} />
           </div>

           {/* Input Box */}
           <form onSubmit={handleSend} className="p-4 bg-[#121212] border-t border-[#1F1F1F] shrink-0">
             <div className="relative flex items-center">
               <input 
                 type="text" 
                 value={input}
                 onChange={e => setInput(e.target.value)}
                 disabled={loading}
                 placeholder="Type your query here..."
                 className="w-full bg-[#1A1A1A] border border-[#1F1F1F] rounded-[16px] py-3.5 pl-5 pr-12 text-[14px] font-medium text-white focus:ring-2 focus:ring-[#EF4444] focus:border-[#EF4444] transition-all outline-none disabled:opacity-50 placeholder-[#6B7280]"
               />
               <button 
                 type="submit" 
                 disabled={loading || !input.trim()}
                 className="absolute right-2 p-2.5 bg-[#EF4444] hover:bg-[#DC2626] disabled:bg-[#333] disabled:text-[#6B7280] text-white rounded-[12px] transition-all flex items-center justify-center shadow-sm disabled:shadow-none hover:-translate-y-0.5"
               >
                 <Send className="w-4 h-4 translate-x-px -translate-y-px" />
               </button>
             </div>
           </form>
         </div>
      )}
    </>
  );
}
