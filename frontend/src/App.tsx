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
      </Routes>
    </Router>
  );
}

export default App;
