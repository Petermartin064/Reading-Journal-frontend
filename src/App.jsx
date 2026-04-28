import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Schedule from './pages/Schedule';
import Settings from './pages/Settings';
import Bookshelf from './pages/Bookshelf';
import Sidebar from './components/Sidebar';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Fixed Library Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(244, 241, 234, 0.6) 0%, rgba(244, 241, 234, 0.9) 100%), url("https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=2070&auto=format&fit=crop")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      <Sidebar />
      <main className="flex-1 ml-56 min-h-screen relative shadow-[inset_20px_0_30px_-20px_rgba(0,0,0,0.1)] z-10">
        {/* Subtle page edge lines on the right */}
        <div className="absolute top-0 right-0 w-4 h-full border-r border-surface-border/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)] hidden xl:block"></div>
        <div className="absolute top-0 right-1 w-4 h-full border-r border-surface-border/30 hidden xl:block"></div>
        <div className="relative">
          <Outlet />
        </div>
      </main>
    </div>
  ) : <Navigate to="/login" />;
};

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app shell */}
        <Route path="/app" element={<ProtectedRoute />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="history" element={<History />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="bookshelf" element={<Bookshelf />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        {/* Redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" />} />
        <Route path="/" element={<Navigate to="/app/dashboard" />} />
        <Route path="*" element={<Navigate to="/app/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
