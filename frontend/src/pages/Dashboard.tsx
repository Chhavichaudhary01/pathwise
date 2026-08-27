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
  Award
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
    Promise.all([
      api.get('/roadmaps').catch(() => ({ data: [] })),
      api.get('/profile').catch(() => ({ data: null }))
    ])
      .then(([roadmapsRes, profileRes]) => {
        setRoadmaps(roadmapsRes.data || []);
        setProfile(profileRes.data || null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute live dynamic statistics from real user roadmaps
  let totalItems = 0;
  let completedItems = 0;
  let inProgressItems = 0;
  const completedSkillSet = new Map<string, number>();
  let nextRecommendedAction = "Complete your first onboarding milestone to build core momentum.";
  let currentGoal = profile?.goal || (roadmaps.length > 0 ? roadmaps[0].title : "Full Stack Web Developer");

  roadmaps.forEach((rm) => {
    if (rm.milestones) {
      rm.milestones.forEach((m: any) => {
        if (m.items) {
          m.items.forEach((item: any) => {
            totalItems++;
            if (item.status === 'COMPLETED') {
              completedItems++;
              if (item.catalogItem?.skills) {
                item.catalogItem.skills.forEach((sk: string) => {
                  completedSkillSet.set(sk, (completedSkillSet.get(sk) || 0) + 1);
                });
              }
            } else if (item.status === 'IN_PROGRESS') {
              inProgressItems++;
              if (!nextRecommendedAction.startsWith('Continue:')) {
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
        bg: pct >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-[#EDE9FE] text-[#7C3AED]'
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
          bg: isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-[#EDE9FE] text-[#7C3AED]'
        });
      }
    });
  }

  if (dynamicCompetencies.length === 0) {
    dynamicCompetencies.push(
      { name: 'Frontend Architecture', percent: 35, color: 'bg-[#5051F9]', bg: 'bg-[#EDE9FE] text-[#7C3AED]' },
      { name: 'REST & API Integration', percent: 45, color: 'bg-[#0284C7]', bg: 'bg-[#E0F2FE] text-[#0284C7]' },
      { name: 'Database & SQL Primitives', percent: 20, color: 'bg-[#DB2777]', bg: 'bg-[#FCE7F3] text-[#DB2777]' }
    );
  }

  return (
    <div className="space-y-6 w-full">
      
      {/* GREETING HEADER & QUICK STATS ROW */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
        <div>
          <p className="text-[11px] font-bold text-slate-400">Personalized Learning & Career Hub</p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5 flex items-center gap-2">
            <span>{getGreeting()} {userName}!</span>
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500 inline" />
          </h1>
        </div>

        {/* Quick Stats Strip */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-2xs text-xs font-bold text-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span><strong>{weeklyHours}h</strong>/wk Pace</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-2xs text-xs font-bold text-slate-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span><strong>{completedItems}</strong> Done</span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-2xs text-xs font-bold text-slate-700">
            <Hourglass className="w-3.5 h-3.5 text-amber-500" />
            <span><strong>{inProgressItems}</strong> In Progress</span>
          </div>
        </div>
      </div>

      {/* AI PERSONALIZED PROGRESS DIGEST (Hero Banner) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4F46E5] via-[#5051F9] to-[#6366F1] p-6 md:p-8 text-white shadow-md">
        
        {/* Sparkle Graphics */}
        <div className="absolute right-12 top-6 text-white/20 text-5xl select-none font-black pointer-events-none">
          ✦
        </div>
        <div className="absolute right-36 bottom-6 text-white/15 text-7xl select-none font-black pointer-events-none">
          ✦
        </div>

        <div className="relative z-10 max-w-xl space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white">
              AI Personalized Progress Digest
            </span>
            <span className="bg-white text-[#5051F9] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
              {completionPercent}% Completed
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-white">
            {completedItems > 0 ? "Momentum in Progress!" : "Ready to Master Your Learning Path"}
          </h2>

          <p className="text-xs text-blue-100 leading-relaxed max-w-lg">
            {completedItems > 0
              ? `You have mastered ${completedItems} of ${totalItems} milestone competencies toward your goal of "${currentGoal}". Your prerequisite sequence is dynamically adapting to your pacing.`
              : `Your topological path for "${currentGoal}" is ready. Follow the prerequisite DAG to master core concepts before advancing to complex frameworks.`}
          </p>

          {/* Next Recommended Action Box */}
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/20 text-xs space-y-1 backdrop-blur-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Next Recommended Milestone:</span>
            </span>
            <p className="text-slate-100 font-medium">{nextRecommendedAction}</p>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-2.5">
            {roadmaps.length > 0 && (
              <button
                onClick={() => navigate(`/roadmap/${roadmaps[0].id}`)}
                className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-full inline-flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            )}
            <button
              onClick={() => navigate('/resume-analyzer')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-full shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>📄 AI Resume Bridge</span>
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs px-4 py-2.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
            >
              Ask AI Coach
            </button>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LOWER SECTION: ROADMAPS & COMPETENCIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2-COLS: ACTIVE LEARNING ROADMAPS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Your Active Roadmaps</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Topologically sorted milestone paths personalized to your goals.
              </p>
            </div>
            <button
              onClick={() => navigate('/onboarding')}
              className="text-xs font-bold text-[#5051F9] hover:underline cursor-pointer"
            >
              + New Path
            </button>
          </div>

          {loading ? (
            <div className="py-12 bg-white rounded-3xl border border-slate-100 p-6 text-center text-slate-400 text-xs">
              <div className="w-7 h-7 border-2 border-[#5051F9] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading your learning paths...
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-3 shadow-xs">
              <div className="text-3xl">🗺️</div>
              <h4 className="text-sm font-extrabold text-slate-900">No Roadmaps Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md hover:border-purple-200 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-[#5051F9] transition-colors">
                          {rm.title}
                        </h4>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {rm.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span>{rm.milestones?.length || 0} Phases</span>
                        <span>•</span>
                        <span>{rDone}/{rTotal} Milestones ({rPct}%)</span>
                        <span>•</span>
                        <span>{rm.createdAt ? new Date(rm.createdAt).toLocaleDateString() : 'Active'}</span>
                      </div>

                      {/* Progress Meter */}
                      <div className="w-full max-w-md bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#5051F9] h-1.5 rounded-full transition-all"
                          style={{ width: `${rPct}%` }}
                        ></div>
                      </div>
                    </div>

                    <button className="self-end sm:self-auto w-8 h-8 rounded-full bg-slate-50 group-hover:bg-[#5051F9] group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shadow-2xs">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT 1-COL: COMPETENCIES MASTERY CARD */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Skill Competencies</h3>
            <Award className="w-4 h-4 text-purple-500" />
          </div>

          <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
            Calculated dynamically from your completed prerequisite milestones.
          </p>

          {/* Competencies Progress Bars */}
          <div className="space-y-3.5 pt-1">
            {dynamicCompetencies.map((comp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{comp.name}</span>
                  <span className="text-[11px] text-slate-500 font-semibold">{comp.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${comp.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${comp.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Jump Links */}
          <div className="pt-3 border-t border-slate-50 space-y-2">
            <button
              onClick={() => navigate('/skill-graph')}
              className="w-full py-2.5 bg-[#F4F6FB] hover:bg-indigo-50 text-[#5051F9] text-xs font-bold rounded-2xl transition-colors text-center cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inspect Full Skill DAG</span>
            </button>

            <button
              onClick={() => navigate('/portfolio')}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-2xl transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
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
