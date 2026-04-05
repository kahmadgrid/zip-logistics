import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import api from '../services/api';

/** Newest first (API already sorts; this keeps order correct if timestamps parse oddly). */
function sortNewestFirst(list) {
  return [...list].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return (b.id ?? 0) - (a.id ?? 0);
  });
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen]                   = useState(false);
  const ref                               = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/api/notifications');
      setNotifications(sortNewestFirst(Array.isArray(data) ? data : []));
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch {}
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => sortNewestFirst(prev.map(n => ({ ...n, read: true }))));
    } catch {}
  };

  const clearAll = async () => {
    if (notifications.length === 0) return;
    if (!window.confirm('Clear all notifications? This cannot be undone.')) return;
    try {
      await api.delete('/api/notifications');
      setNotifications([]);
    } catch {
      // silently fail
    }
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-border/40 transition-colors"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white
                           text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-surface-border
                        rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col gap-2 px-4 py-3 border-b border-surface-border sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-white">
              Notifications {unread > 0 && <span className="text-slate-400 font-normal">({unread} unread)</span>}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearAll(); }}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markAsRead(n.id)}
                  className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors
                    hover:bg-surface-border/30
                    ${!n.read ? 'bg-brand-500/5' : ''}`}
                >
                  {/* Unread dot */}
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0
                    ${!n.read ? 'bg-brand-400' : 'bg-transparent'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'text-white' : 'text-slate-400'}`}>
                      {n.message}
                    </p>
                    {n.createdAt && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(n.createdAt).toLocaleString()}

                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-surface-border text-center">
              <p className="text-xs text-slate-500">{notifications.length} total notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
