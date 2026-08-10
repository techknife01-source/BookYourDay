import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Ticket, Tag, Clock, X } from 'lucide-react';
import { NotificationItem } from '../../types';
import { BookingService } from '../../services/bookingService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setNotifications(BookingService.getNotifications());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    BookingService.markNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return <Ticket className="w-4 h-4 text-emerald-400" />;
      case 'offer':
        return <Tag className="w-4 h-4 text-rose-400" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0b1329] border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-600/20 border border-rose-500/30 rounded-xl flex items-center justify-center text-rose-500">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Notifications</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 bg-rose-600/10 border border-rose-500/20 px-2.5 py-1 rounded-lg"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all ${
                notif.isRead
                  ? 'bg-slate-900/30 border-slate-800/80 opacity-80'
                  : 'bg-slate-900/80 border-slate-700 shadow-md shadow-black/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                    <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-12 space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
