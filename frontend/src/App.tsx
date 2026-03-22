import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import Layout from "./components/Layout";
import JobFeed from "./pages/JobFeed";
import Applications from "./pages/Applications";
import ResumeUpload from "./pages/ResumeUpload";
import ChatUI from "./pages/ChatUI";
import Login from "./pages/Login";
import { useAuthStore } from "./store/useAuthStore";

import { useApplicationStore } from "./store/useApplicationStore";

import { useState, useEffect } from "react";

function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0B] flex flex-col items-center justify-center p-4 font-sans text-white text-center">
      <h1 className="text-6xl font-black text-[#EF4444] mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-[#A1A1AA] mb-8 font-medium">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="px-6 py-3 bg-[#EF4444] hover:bg-[#DC2626] rounded-xl font-bold shadow-lg transition-transform hover:-translate-y-0.5">
        Return Home
      </a>
    </div>
  );
}

function ProtectedRoute() {
  const [isMounted, setIsMounted] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const userEmail = useAuthStore(state => state.userEmail);
  const login = useAuthStore(state => state.login);
  const logout = useAuthStore(state => state.logout);
  const setApplications = useApplicationStore(state => state.setApplications);
  const location = useLocation();
  
  useEffect(() => {
    const checkSession = async () => {
      if (!userEmail) {
        setIsMounted(true);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/auth/me`, {
          headers: { "x-user-email": userEmail }
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        login(data.email, data.hasResume);
        setApplications(data.applications || []);
      } catch (err) {
        logout();
      } finally {
        setIsMounted(true);
      }
    };
    
    checkSession();
  }, [userEmail]);

  if (!isMounted) {
    return null; // Wait for session fetch
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<JobFeed />} />
            <Route path="applications" element={<Applications />} />
            <Route path="resume" element={<ResumeUpload />} />
            <Route path="chat" element={<ChatUI />} />
          </Route>
        </Route>
        
        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
