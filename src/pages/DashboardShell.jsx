import React from 'react';
import { useAuthStore } from '../store/authStore';
import { LogOut } from 'lucide-react';

const DashboardShell = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10 p-6 surface-card">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Reading Command Center
          </h1>
          <p className="text-text-muted mt-1">Welcome back, {user?.username}</p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-lg hover:bg-surface-hover"
        >
          <LogOut size={18} />
          <span className="font-medium">Sign out</span>
        </button>
      </header>
      
      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="surface-card p-6 md:col-span-2 min-h-[400px] flex items-center justify-center">
          <p className="text-text-muted font-medium">Dashboard Content (Phase 2)</p>
        </div>
        <div className="surface-card p-6 min-h-[400px] flex items-center justify-center">
          <p className="text-text-muted font-medium">Schedule (Phase 2)</p>
        </div>
      </main>
    </div>
  );
};

export default DashboardShell;
