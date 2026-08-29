import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  Hourglass,
  ChevronRight,
  Award,
  Trash2
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/roadmaps').catch(() => ({ data: [] })),
      api.get('/profile').catch(() => ({ data: null }))
    ])
      .then(([roadmapsRes, profileRes]) => {
        const rawRoadmaps: any[] = roadmapsRes.data || [];
        setRoadmaps(deduplicateRoadmaps(rawRoadmaps));
        setProfile(profileRes.data || null);
      })
      .finally(() => setLoading(false));
  };

  const deduplicateRoadmaps = (list: any[]) => {
    const map = new Map<string, any>();
    list.forEach(rm => {
      const titleKey = (rm.title || 'General Path').trim().toLowerCase();
      const existing = map.get(titleKey);
      if (!existing) {
        map.set(titleKey, rm);
      } else {
        // Keep the one with more milestones or newer creation
        const existingCount = existing.milestones?.length || 0;
        const currentCount = rm.milestones?.length || 0;
        if (currentCount > existingCount) {
          map.set(titleKey, rm);
        }
      }
    });
    return Array.from(map.values());
  };

  const handleDeleteRoadmap = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this learning path?')) return;
    
    setRoadmaps(prev => prev.filter(r => r.id !== id));
    try {
      await api.delete(`/roadmaps/${id}`);
    } catch (err) {
      console.error('Failed to delete roadmap:', err);
    }
  };

  // Compute live dynamic statistics from real user roadmaps
  let totalItems = 0;
  let completedItems = 0;
  let inProgressItems = 0;
  const completedSkillSet = new Map<string, number>();
  let nextRecommendedAction = 'Launch your next milestone challenge in the interactive DAG';

  roadmaps.forEach((rm) => {
    if (rm.milestones) {
      rm.milestones.forEach((m: any) => {
        if (m.items) {
          m.items.forEach((item: any) => {
            totalItems++;
            if (item.status === 'COMPLETED') {
              completedItems++;
              if (item.catalogItem?.skills) {
                item.catalogItem.skills.forEach((s: string) => {
                  completedSkillSet.set(s, (completedSkillSet.get(s) || 0) + 1);
                });
              }
            } else if (item.status === 'IN_PROGRESS') {
              inProgressItems++;
              if (nextRecommendedAction === 'Launch your next milestone challenge in the interactive DAG') {
                nextRecommendedAction = `Continue: "${item.catalogItem?.title || 'Active Module'}" in ${m.title}`;
              }
            }
          });
        }
      });
    }
  });

  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const weeklyHours = profile?.weeklyHours || 10;
  const userName = profile?.goal 
    ? (user?.email?.split('@')[0] || 'Learner') 
    : (user?.email?.split('@')[0] || 'Learner');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Build competencies list dynamically
  const dynamicCompetencies: { name: string; percent: number; color: string; bg: string }[] = [];
  if (completedSkillSet.size > 0) {
    completedSkillSet.forEach((count, skillName) => {
      const pct = Math.min(100, Math.round((count / Math.max(1, totalItems * 0.2)) * 100));
      dynamicCompetencies.push({
        name: skillName,
        percent: Math.max(25, pct),
        color: pct >= 80 ? 'bg-[#10B981]' : 'bg-[#5051F9]',
        bg: pct >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-[#EDE9FE] dark:bg-indigo-950/40 text-[#7C3AED] dark:text-indigo-300'
      });
    });
  } else if (roadmaps.length > 0 && roadmaps[0].milestones?.length > 0) {
    const firstItems = roadmaps[0].milestones[0]?.items || [];
    firstItems.slice(0, 4).forEach((it: any) => {
      if (it.catalogItem?.skills?.[0]) {
        const isDone = it.status === 'COMPLETED';
        const isProg = it.status === 'IN_PROGRESS';
        dynamicCompetencies.push({
          name: it.catalogItem.skills[0],
          percent: isDone ? 100 : (isProg ? 50 : 20),
          color: isDone ? 'bg-[#10B981]' : 'bg-[#5051F9]',
          bg: isDone ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-[#EDE9FE] dark:bg-indigo-950/40 text-[#7C3AED] dark:text-indigo-300'
        });
      }
    });
  }

  if (dynamicCompetencies.length === 0) {
    dynamicCompetencies.push(
      { name: 'Frontend Architecture', percent: 35, color: 'bg-[#5051F9]', bg: 'bg-[#EDE9FE] dark:bg-indigo-950/40 text-[#7C3AED] dark:text-indigo-300' },
      { name: 'REST & API Integration', percent: 45, color: 'bg-[#0284C7]', bg: 'bg-[#E0F2FE] dark:bg-sky-950/40 text-[#0284C7] dark:text-sky-300' },
      { name: 'Database & SQL Primitives', percent: 20, color: 'bg-[#DB2777]', bg: 'bg-[#FCE7F3] dark:bg-pink-950/40 text-[#DB2777] dark:text-pink-300' }
    );
  }

  return (
    <div className="space-y-6 w-full text-left">
      
      {/* GREETING HEADER & QUICK STATS ROW */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Personalized Learning & Career Hub</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 flex items-center gap-2">
            <span>{getGreeting()} {userName}!</span>
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500 inline" />
          </h1>
        </div>

        {/* Quick Stats Strip */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Daily Streak Flame Pill */}
          <div 
            onClick={() => navigate('/settings')}
            className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-2xs text-xs font-extrabold text-amber-800 dark:text-amber-300 cursor-pointer hover:scale-105 transition-transform"
            title="Daily Active Streak (Click to manage daily email reminders)"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{profile?.streakCount || 1} Day Streak</span>
          </div>

          {/* Goal Badge */}
          <div className="bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-2xs text-xs font-extrabold text-[#5051F9] dark:text-indigo-300">
            <Sparkles className="w-4 h-4 text-[#5051F9] dark:text-indigo-400" />
            <span>Target: {profile?.goal || 'Full Stack Developer'}</span>
          </div>
        </div>
      </div>

      {/* HERO DASHBOARD BANNER */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#4F46E5] via-[#5B50F6] to-[#7C3AED] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Abstract Background Ambient Glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-10 w-48 h-48 rounded-full bg-purple-400/20 blur-xl pointer-events-none"></div>

        {/* Left Side: Summary & Action */}
        <div className="space-y-4 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
            <span>✨ AI Learning Coach Active</span>
          </div>

          <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
            Accelerate your mastery toward {profile?.goal || 'Engineering Roles'} with structured topological sequencing.
          </h2>

          <p className="text-xs md:text-sm text-blue-100 font-medium leading-relaxed">
            {nextRecommendedAction}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => navigate('/roadmap')}
              className="bg-white hover:bg-slate-50 text-[#5051F9] font-black text-xs px-5 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <span>Resume Active Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/resume-analyzer')}
              className="bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              Scan Resume Gaps 📄
            </button>
          </div>
        </div>

        {/* Right Side: Circular Gauge Progress */}
        <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-3xl p-5 border border-white/20 flex flex-col items-center justify-center min-w-[200px] z-10 shadow-lg">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/20"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-white transition-all duration-1000 ease-out"
                strokeDasharray={`${completionPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black">{completionPercent}%</span>
              <span className="text-[10px] text-blue-200 font-bold uppercase">Mastered</span>
            </div>
          </div>
          <span className="text-[11px] text-blue-100 font-bold mt-2">
            {completedItems} of {totalItems} Milestones Done
          </span>
        </div>

      </div>

      {/* THREE LIVE METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Completed Milestones */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Completed Milestones
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {completedItems} <span className="text-xs text-slate-400 font-medium">/ {totalItems}</span>
            </h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              {completionPercent}% overall completion
            </p>
          </div>
        </div>

        {/* In Progress Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-[#5051F9] dark:text-indigo-400 flex items-center justify-center font-bold">
            <Hourglass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active In Progress
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {inProgressItems}
            </h3>
            <p className="text-[10px] text-[#5051F9] dark:text-indigo-400 font-bold">
              Current study sprint
            </p>
          </div>
        </div>

        {/* Weekly Pacing Commitment */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Weekly Pacing
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {weeklyHours} <span className="text-xs text-slate-400 font-medium">hrs/week</span>
            </h3>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
              Optimal study velocity
            </p>
          </div>
        </div>

      </div>

      {/* MAIN 2-COLUMN SECTION: ACTIVE ROADMAPS & SKILL COMPETENCIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2-COLS: DEDUPLICATED ACTIVE ROADMAP TRACKS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Your Learning Tracks</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Topologically sorted milestone paths personalized to your goals.
              </p>
            </div>
            <button
              onClick={() => navigate('/onboarding')}
              className="text-xs font-bold text-[#5051F9] dark:text-indigo-400 hover:underline cursor-pointer"
            >
              + New Track
            </button>
          </div>

          {loading ? (
            <div className="py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 text-center text-slate-400 text-xs">
              <div className="w-7 h-7 border-2 border-[#5051F9] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading your learning paths...
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 text-center space-y-3 shadow-xs">
              <div className="text-3xl">🗺️</div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No Roadmaps Yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Generate an optimal prerequisite-resolved roadmap personalized to your career goals.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="bg-[#5051F9] hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-xs cursor-pointer"
              >
                Generate Your First Roadmap 🚀
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {roadmaps.map((rm) => {
                let rTotal = 0;
                let rDone = 0;
                if (rm.milestones) {
                  rm.milestones.forEach((m: any) => {
                    if (m.items) {
                      m.items.forEach((it: any) => {
                        rTotal++;
                        if (it.status === 'COMPLETED') rDone++;
                      });
                    }
                  });
                }
                const rPct = rTotal > 0 ? Math.round((rDone / rTotal) * 100) : 0;

                return (
                  <div
                    key={rm.id}
                    onClick={() => navigate(`/roadmap/${rm.id}`)}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-[#5051F9] dark:group-hover:text-indigo-400 transition-colors truncate">
                          {rm.title}
                        </h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          rPct === 100 
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' 
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {rPct === 100 ? '🎓 COMPLETED' : (rm.status || 'ACTIVE')}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        <span>{rm.milestones?.length || 0} Phases</span>
                        <span>•</span>
                        <span>{rDone}/{rTotal} Milestones ({rPct}%)</span>
                        <span>•</span>
                        <span>{rm.createdAt ? new Date(rm.createdAt).toLocaleDateString() : 'Active'}</span>
                      </div>

                      {/* Progress Meter */}
                      <div className="w-full max-w-md bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#5051F9] h-1.5 rounded-full transition-all"
                          style={{ width: `${rPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={(e) => handleDeleteRoadmap(e, rm.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Delete this roadmap"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-[#5051F9] group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shadow-2xs">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT 1-COL: COMPETENCIES MASTERY CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Skill Competencies</h3>
            <Award className="w-4 h-4 text-purple-500" />
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
            Calculated dynamically from your completed prerequisite milestones.
          </p>

          {/* Competencies Progress Bars */}
          <div className="space-y-3.5 pt-1">
            {dynamicCompetencies.map((comp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>{comp.name}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{comp.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${comp.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${comp.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Jump Links */}
          <div className="pt-3 border-t border-slate-50 dark:border-slate-800 space-y-2">
            <button
              onClick={() => navigate('/skill-graph')}
              className="w-full py-2.5 bg-[#F4F6FB] dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700/80 text-[#5051F9] dark:text-indigo-300 text-xs font-bold rounded-2xl transition-colors text-center cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspect Full Skill DAG</span>
            </button>

            <button
              onClick={() => navigate('/portfolio')}
              className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-2xl transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-slate-500" />
              <span>Shareable Portfolio</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
