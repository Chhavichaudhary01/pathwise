import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Compass,
  Layers,
  MessageSquare,
  Share2,
  Award,
  Settings,
  LogOut,
  Search,
  Bell,
  Mail,
  Plus,
  Target,
  Clock,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/profile').catch(() => ({ data: null })),
      api.get('/roadmaps').catch(() => ({ data: [] }))
    ]).then(([pRes, rRes]) => {
      setProfile(pRes.data || null);
      setRoadmaps(rRes.data || []);
    });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userName = profile?.goal 
    ? (user?.email?.split('@')[0] || 'Learner') 
    : (user?.email?.split('@')[0] || 'Learner');

  const currentGoal = profile?.goal || (roadmaps.length > 0 ? roadmaps[0].title : "Full Stack Web Developer");
  const weeklyHours = profile?.weeklyHours || 10;

  const currentPath = location.pathname;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { label: 'Projects', path: '/projects', icon: FolderKanban, alias: '/roadmap' },
    { label: 'My Tasks', path: '/my-task', icon: CheckSquare },
    { label: 'Coursue LMS', path: '/coursue', icon: Compass },
    { label: 'Roadmaps', path: '/roadmap', icon: Layers },
    { label: 'AI Career Coach', path: '/chat', icon: MessageSquare },
    { label: 'Skill Graph (DAG)', path: '/skill-graph', icon: Share2 },
    { label: 'Portfolio', path: '/portfolio', icon: Award },
  ];

  const isNavActive = (item: typeof navItems[0]) => {
    if (item.exact) return currentPath === item.path;
    if (item.alias && currentPath.startsWith(item.alias)) return true;
    return currentPath.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-slate-800 font-sans antialiased p-2 md:p-6 flex justify-center items-start">
      <div className="w-full max-w-[1520px] bg-[#F8F9FD] rounded-3xl p-3 md:p-6 shadow-sm border border-slate-200/50 flex flex-col lg:flex-row gap-6">

        {/* Mobile Header Bar */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5051F9] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              ✦
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">PathWise</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* SHARED PERSISTENT LEFT SIDEBAR */}
        {/* ========================================================================= */}
        <aside
          className={`
            ${mobileMenuOpen ? 'flex' : 'hidden'} lg:flex
            w-full lg:w-60 shrink-0 bg-transparent py-2 flex-col justify-between space-y-8
          `}
        >
          <div className="space-y-7">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 px-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 rounded-xl bg-[#5051F9] text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                PathWise
              </span>
            </div>

            {/* Navigation Group */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 px-3 uppercase">
                Navigation
              </span>
              <nav className="space-y-1 text-xs font-semibold">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(item);
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(item.path);
                      }}
                      className={`
                        w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all text-left relative
                        ${active
                          ? 'text-[#5051F9] font-bold bg-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'}
                      `}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#5051F9] rounded-r-full"></span>
                      )}
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Target Goal Summary Card */}
            <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                <span>Active Target</span>
                <Target className="w-3.5 h-3.5 text-[#5051F9]" />
              </div>
              <h5 className="text-xs font-extrabold text-slate-900 leading-snug truncate">
                {currentGoal}
              </h5>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{weeklyHours} hrs/week pacing</span>
              </div>
            </div>

          </div>

          {/* Settings & Logout */}
          <div className="space-y-1 pt-4 text-xs font-semibold">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 px-3 uppercase block mb-2">
              Settings
            </span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/settings');
              }}
              className={`
                w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all text-left
                ${currentPath === '/settings' ? 'text-[#5051F9] font-bold bg-white shadow-xs' : 'text-slate-500 hover:text-slate-900 hover:bg-white/60'}
              `}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-[#F97316] hover:bg-orange-50/50 transition-all text-left"
            >
              <LogOut className="w-4 h-4 text-[#F97316]" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 2. MAIN CONTENT AREA & TOP HEADER BAR */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col space-y-6 overflow-hidden min-w-0">
          
          {/* Persistent Top Search & User Actions Bar */}
          <header className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input with ⌘F hint */}
            <div className="relative flex-1 max-w-lg w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search roadmaps, projects, skills, or milestones...."
                className="w-full bg-white border border-slate-200/80 rounded-full pl-10 pr-12 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/20 focus:border-[#5051F9] shadow-2xs transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-medium border border-slate-200">
                ⌘F
              </span>
            </div>

            {/* Action Buttons & Profile */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-[#5051F9] hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 shadow-xs transition-transform hover:scale-105 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Roadmap</span>
              </button>

              <button 
                onClick={() => navigate('/chat')}
                className="w-9 h-9 rounded-full bg-white border border-slate-200/70 flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                title="AI Career Coach"
              >
                <Mail className="w-4 h-4" />
              </button>

              <button 
                className="relative w-9 h-9 rounded-full bg-white border border-slate-200/70 flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-2xs transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              <div 
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2.5 bg-white border border-slate-200/70 py-1 px-2.5 rounded-full shadow-2xs cursor-pointer hover:border-purple-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden bg-purple-100">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 pr-1">{userName}</span>
              </div>
            </div>

          </header>

          {/* Dynamic Page Outlet */}
          <main className="flex-1 w-full min-w-0">
            <Outlet />
          </main>

        </div>

      </div>
    </div>
  );
}
