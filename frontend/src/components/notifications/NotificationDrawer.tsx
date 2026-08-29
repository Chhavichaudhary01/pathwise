import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Flame, 
  Layers, 
  Award, 
  Sparkles, 
  ExternalLink,
  X,
  FileText
} from 'lucide-react';
import api from '@/lib/api';

export interface UserNotification {
  id: string;
  title: string;
  message: string;
  type: string; // STREAK, ROADMAP, QUIZ, SYSTEM, RESUME
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationDrawer({ isOpen, onClose, onUnreadCountChange }: NotificationDrawerProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'STREAK' | 'ROADMAP' | 'QUIZ'>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      const items: UserNotification[] = res.data || [];
      setNotifications(items);
      const unread = items.filter(n => !n.isRead).length;
      if (onUnreadCountChange) onUnreadCountChange(unread);
    } catch (err) {
      console.warn('Failed to load notifications from backend, using local notifications:', err);
      // Fallback local notifications for seamless offline/dev UX
      const fallback: UserNotification[] = [
        {
          id: '1',
          title: '🔥 Keep Your Daily Streak Alive!',
          message: 'Complete at least 1 milestone today to protect your active study streak.',
          type: 'STREAK',
          link: '/roadmap',
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: '🗺️ Roadmap Milestone Ready',
          message: 'Your next module is ready in your active topological track.',
          type: 'ROADMAP',
          link: '/roadmap',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: '3',
          title: '📄 Resume Analysis Insights',
          message: 'Check your updated ATS match score and recommended bridge milestones.',
          type: 'RESUME',
          link: '/resume-analyzer',
          isRead: true,
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        }
      ];
      setNotifications(fallback);
      if (onUnreadCountChange) onUnreadCountChange(fallback.filter(n => !n.isRead).length);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, link?: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    const newUnread = notifications.filter(n => n.id !== id && !n.isRead).length;
    if (onUnreadCountChange) onUnreadCountChange(newUnread);

    try {
      await api.put(`/notifications/${id}/read`);
    } catch (e) {
      console.debug('Mark as read API skipped:', e);
    }

    if (link) {
      onClose();
      navigate(link);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    if (onUnreadCountChange) onUnreadCountChange(0);

    try {
      await api.put('/notifications/read-all');
    } catch (e) {
      console.debug('Mark all read API skipped:', e);
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALL') return true;
    return n.type?.toUpperCase() === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'STREAK':
        return <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />;
      case 'ROADMAP':
        return <Layers className="w-4 h-4 text-[#5051F9]" />;
      case 'QUIZ':
        return <Award className="w-4 h-4 text-amber-500" />;
      case 'RESUME':
        return <FileText className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-[#5051F9] dark:text-indigo-400 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 dark:text-slate-100">
              Notification Center
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] font-bold text-[#5051F9] dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 px-2 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3 h-3" />
              <span>Read all</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] font-bold overflow-x-auto">
        {(['ALL', 'STREAK', 'ROADMAP', 'QUIZ'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              filter === tab
                ? 'bg-[#5051F9] text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab === 'ALL' ? 'All' : tab === 'STREAK' ? '🔥 Streaks' : tab === 'ROADMAP' ? '🗺️ Roadmaps' : '🎓 Quizzes'}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-[#5051F9] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Syncing notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No Notifications</p>
            <p className="text-[10px] text-slate-400">You're completely up to date with your learning journey!</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkAsRead(notif.id, notif.link)}
              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all cursor-pointer flex items-start gap-3 group relative ${
                !notif.isRead ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
              }`}
            >
              {/* Type Icon Badge */}
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                {getTypeIcon(notif.type)}
              </div>

              {/* Text Body */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-bold truncate ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {notif.title}
                  </h4>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#5051F9] shrink-0"></span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                  </span>
                  {notif.link && (
                    <span className="text-[#5051F9] dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Open <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Link */}
      <div className="p-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center">
        <button
          onClick={() => {
            onClose();
            navigate('/settings');
          }}
          className="text-[11px] font-bold text-[#5051F9] dark:text-indigo-400 hover:underline cursor-pointer"
        >
          ⚙️ Notification & Daily Reminder Settings
        </button>
      </div>
    </div>
  );
}
