import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart2, History, CalendarDays, Library, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { fetchClient } from '../api/fetchClient';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/app/history', icon: History, label: 'History' },
  { to: '/app/schedule', icon: CalendarDays, label: 'Schedule' },
  { to: '/app/bookshelf', icon: Library, label: 'Bookshelf' },
  { to: '/app/settings', icon: SettingsIcon, label: 'Settings' },
];

const Sidebar = () => {
  const logout = useAuthStore(state => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Try to end any active session before logging out
    try {
      await fetchClient('/sessions/end/', {
        method: 'POST',
        body: JSON.stringify({ notes: 'Auto-ended on logout.' }),
      });
    } catch (e) {
      // Ignore if no active session found
    }
    await logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-surface/90 backdrop-blur-md flex flex-col z-20 book-spine">
      {/* Logo */}
      <div className="p-5 border-b border-surface-border">
        <span className="font-serif text-xl text-text-primary">Read Journal</span>
        <span className="block text-xs text-text-muted mt-0.5">Reading Command Center</span>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-surface-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all w-full"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
