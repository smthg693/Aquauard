import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Bell, LogOut, Check } from 'lucide-react';
import { INITIAL_NOTIFICATIONS } from '../../lib/mockDataService';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden text-slate-600 hover:text-navy-700 p-1.5 rounded-ag-sm hover:bg-slate-100 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block text-xs text-agText-muted font-medium">
          Role Session: <strong className="text-navy-700 font-semibold">{user?.role || 'Guest'}</strong>
        </div>
      </div>

      {/* Right: Notifications & Profile menu */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-navy-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-agStatus-danger text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-ag-lg border border-slate-200 shadow-modal z-50 p-3 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-agText-primary">Notifications ({notifications.length})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark read
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className={`py-2 text-xs space-y-0.5 ${!n.isRead ? 'bg-cyan-50/40 p-2 rounded' : ''}`}>
                    <p className="font-semibold text-agText-primary">{n.title}</p>
                    <p className="text-agText-secondary">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Pill & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-navy-700 text-white flex items-center justify-center text-xs font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block text-left pr-1">
              <p className="text-xs font-semibold text-agText-primary leading-none">{user?.name || 'User'}</p>
              <p className="text-[10px] text-agText-muted leading-none mt-1">{user?.role}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-ag-lg border border-slate-200 shadow-modal z-50 p-2 space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 text-xs">
                <p className="font-semibold text-agText-primary truncate">{user?.name}</p>
                <p className="text-[11px] text-agText-muted truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-ag-sm transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
