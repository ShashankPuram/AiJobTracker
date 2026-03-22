import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { Briefcase, FileText, Send, LogOut, User, Menu, X, Settings, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useApplicationStore } from "../store/useApplicationStore";
import AIAssistant from "./AIAssistant";

const navItems = [
  { path: "/", icon: Briefcase, label: "Job Feed" },
  { path: "/applications", icon: Send, label: "Applications" },
  { path: "/resume", icon: FileText, label: "Resume Match" },
];

export default function Layout() {
  const logout = useAuthStore(state => state.logout);
  const userEmail = useAuthStore(state => state.userEmail);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingJob, setPendingJob] = useState<any | null>(null);
  
  const addApplication = useApplicationStore(state => state.addApplication);

  useEffect(() => {
    const handleReturn = () => {
      console.log("[Global Tracking] Event fired. visibilityState:", document.visibilityState, "hasFocus:", document.hasFocus());
      
      const storedJobStr = localStorage.getItem('pendingTrackingJob');
      if (storedJobStr) {
        console.log("[Global Tracking] Found stored job context in localStorage:", storedJobStr);
        try {
          const storedJob = JSON.parse(storedJobStr);
          // Wait 400ms to ensure React completely paints the screen
          setTimeout(() => {
            setPendingJob(storedJob);
            localStorage.removeItem('pendingTrackingJob');
            console.log("[Global Tracking] Popup triggered successfully!");
          }, 400);
        } catch(e) {
          console.error("Error parsing stored job", e);
        }
      }
    };

    // Check on initial mount fully
    handleReturn();

    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", handleReturn);
    
    return () => {
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", handleReturn);
    };
  }, []);

  const trackApplication = (status: 'yes' | 'no') => {
    if (status === 'yes' && pendingJob) {
      addApplication(pendingJob);
    }
    setPendingJob(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div 
      className="min-h-screen bg-transparent text-[#FFFFFF] font-sans relative flex flex-col overflow-x-hidden"
    >
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-[70px] bg-[#0B0B0B] border-b border-[#1F1F1F] z-50 transition-all flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight hover:opacity-90">
          <Briefcase className="w-6 h-6 text-[#EF4444]" />
          <span className="hidden sm:block">AI JobTracker</span>
        </Link>
        
        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-6 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => (
             <NavLink
               key={item.path}
               to={item.path}
               className={({ isActive }) =>
                 `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-bold text-[15px] ${
                   isActive
                     ? "bg-[#1A1A1A] text-white"
                     : "text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#EF4444]"
                 }`
               }
             >
               <item.icon className="w-5 h-5" />
               {item.label}
             </NavLink>
          ))}
        </nav>

        {/* Right: Profile Dropdown & Mobile Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Desktop Profile Dropdown */}
          <div className="relative hidden md:block">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-[#1A1A1A] transition-colors border border-transparent hover:border-[#333] focus:outline-none focus:ring-2 focus:ring-[#EF4444]"
            >
              <div className="w-8 h-8 bg-[#1A1A1A] text-[#A1A1AA] hover:text-white rounded-full flex items-center justify-center transition-colors">
                <User className="w-5 h-5" />
              </div>
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-56 bg-[#121212] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#1F1F1F] z-50 overflow-hidden py-1 animate-slide-up origin-top-right">
                  <div className="px-4 py-3 border-b border-[#1F1F1F] bg-[#0B0B0B]">
                    <p className="text-sm font-semibold text-white truncate">{userEmail || "User"}</p>
                  </div>
                  <Link to="/" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#EF4444] transition-colors">
                    <Settings className="w-4 h-4" /> Profile / Settings
                  </Link>
                  <Link to="/resume" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#EF4444] transition-colors">
                    <FileText className="w-4 h-4" /> Update Resume
                  </Link>
                  <div className="h-px bg-[#1F1F1F] my-1"></div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#EF4444] hover:bg-[#1A1A1A] hover:text-[#EF4444] transition-colors text-left">
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#EF4444] rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[70px] left-0 right-0 bg-[#0B0B0B] border-b border-[#1F1F1F] z-40 shadow-lg animate-slide-up">
           <nav className="flex flex-col p-4 space-y-2">
             {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[15px] ${
                      isActive
                        ? "bg-[#1A1A1A] text-white"
                        : "text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#EF4444]"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
             ))}
             <div className="h-px bg-[#1F1F1F] my-2"></div>
             <div className="px-4 py-2">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Account</p>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm font-medium text-[#A1A1AA] hover:text-[#EF4444]">
                  <Settings className="w-4 h-4" /> Profile / Settings
                </Link>
                <Link to="/resume" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 py-2 text-sm font-medium text-[#A1A1AA] hover:text-[#EF4444]">
                  <FileText className="w-4 h-4" /> Update Resume
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 py-2 text-sm font-medium text-[#EF4444] hover:text-[#DC2626] text-left mt-1">
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
             </div>
           </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 mt-[70px] min-h-[calc(100vh-70px)]">
        <div className="mx-auto w-full max-w-[1600px] h-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Global Smart Tracking Floating Prompt with Backdrop */}
      {pendingJob && (
         <div 
           className="fixed inset-0 z-[100] flex items-center lg:items-end lg:pb-12 justify-center bg-black/40 backdrop-blur-[4px] p-4 animate-in fade-in duration-300" 
           onClick={(e) => { if(e.target === e.currentTarget) setPendingJob(null); }}
         >
            <div className="bg-[#121212] border border-[#1F1F1F] rounded-[20px] p-6 flex flex-col gap-5 w-full max-w-[420px] animate-slide-up relative" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(239,68,68,0.1)' }}>
               <button onClick={() => setPendingJob(null)} className="absolute top-4 right-4 text-[#6B7280] hover:text-[#EF4444] bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-full p-1.5 transition-colors">
                 <X className="w-5 h-5" />
               </button>
               
               <div className="flex flex-col items-center text-center mt-2">
                 <div className="w-12 h-12 rounded-full bg-[#1A1A1A] text-[#EF4444] flex items-center justify-center mb-4 border border-[#EF4444]/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                   <Sparkles className="w-6 h-6" />
                 </div>
                 <h3 className="text-[18px] font-bold text-white leading-snug mb-2">
                   Welcome back! 👋 <br />Did you apply for this role?
                 </h3>
                 <div className="bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl p-3.5 w-full mt-2">
                   <p className="text-[16px] font-bold text-[#EF4444] leading-snug line-clamp-1">
                     {pendingJob.title}
                   </p>
                   <p className="text-[14px] font-medium text-[#A1A1AA] mt-1 line-clamp-1">
                     {pendingJob.company}
                   </p>
                 </div>
               </div>
               
               <div className="flex flex-col gap-3 mt-2">
                  <button onClick={() => trackApplication('yes')} className="w-full py-3.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-[15px] font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                     ✅ Yes, I applied
                  </button>
                  <button onClick={() => trackApplication('no')} className="w-full py-3.5 bg-transparent text-[#EF4444] text-[15px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-[#EF4444] hover:bg-[#EF4444] hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:-translate-y-0.5">
                     ⏳ Not yet, remind me later
                  </button>
                  <button onClick={() => setPendingJob(null)} className="text-[13px] font-medium text-[#6B7280] hover:text-[#A1A1AA] mt-1 text-center transition-colors">
                    ❌ Skip for now
                  </button>
               </div>
            </div>
         </div>
      )}

      <AIAssistant />
    </div>
  );
}
