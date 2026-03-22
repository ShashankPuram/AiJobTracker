import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Lock, Mail, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useApplicationStore } from "../store/useApplicationStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const login = useAuthStore(state => state.login);
  const setApplications = useApplicationStore(state => state.setApplications);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        login(data.user.email, data.user.hasResume);
        setApplications(data.user.applications || []);
        navigate(data.user.hasResume ? "/" : "/resume");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Server error during login.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-[#121212] rounded-3xl p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#1F1F1F]">
        <div className="w-16 h-16 bg-[#1A1A1A] border border-[#1F1F1F] text-[#EF4444] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Briefcase className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-bold text-white text-center tracking-tight mb-2">Welcome Back</h2>
        <p className="text-[#A1A1AA] text-center mb-8 text-sm font-medium">Log in to access your curated AI JobTracker matches.</p>

        {error && (
          <div className="mb-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold text-[#EF4444]">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="test@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl text-sm font-medium text-white focus:bg-[#222] focus:outline-none focus:ring-2 focus:ring-[#EF4444] transition-all shadow-sm placeholder-[#6B7280]"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black text-[#6B7280] uppercase tracking-widest block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="test@123"
                className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#1F1F1F] rounded-xl text-sm font-medium text-white focus:bg-[#222] focus:outline-none focus:ring-2 focus:ring-[#EF4444] transition-all shadow-sm placeholder-[#6B7280]"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full py-3.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold tracking-wide rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-[0_0_15px_rgba(239,68,68,0.25)] mt-4 flex justify-center items-center gap-2 group"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
}
