import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  Award, 
  CheckCircle2, 
  Zap, 
  Clock, 
  FileText, 
  Calendar,
  Layers
} from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { BorderBeam } from '@/components/ui/border-beam';
import { Button } from '@/components/ui/button';

interface PathWiseBentoGridProps {
  streakDays?: number;
  studyHoursTotal?: number;
  resumeScore?: number;
  activeRoadmap?: any;
  onOpenSandbox?: (skill: any) => void;
}

export const PathWiseBentoGrid: React.FC<PathWiseBentoGridProps> = ({
  streakDays = 14,
  studyHoursTotal = 38,
  resumeScore = 84,
  activeRoadmap,
  onOpenSandbox
}) => {
  const navigate = useNavigate();

  // Generate 28-day study heatmap data
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      // Simulate realistic activity level (0: rest, 1: light, 2: medium, 3: heavy)
      const dayNum = d.getDay();
      const intensity = (dayNum === 0 || dayNum === 6) 
        ? (i % 3 === 0 ? 3 : 2) 
        : (i % 4 === 0 ? 1 : i % 5 === 0 ? 0 : 2);
      days.push({
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        intensity
      });
    }
    return days;
  }, []);

  // Compute active milestone from roadmap
  const activeMilestone = useMemo(() => {
    if (!activeRoadmap?.milestones) {
      return {
        title: 'Phase 2: Full-Stack React & Spring Boot Integration',
        currentSkill: 'Topological Prerequisite DAGs & Micro-Sandboxes',
        hoursLeft: 4.5,
        progress: 68
      };
    }

    let foundCurrentSkill: string | null = null;
    let foundMilestoneTitle = activeRoadmap.milestones[0]?.title || 'Phase 1';
    let total = 0;
    let done = 0;

    activeRoadmap.milestones.forEach((m: any) => {
      (m.items || []).forEach((item: any) => {
        total++;
        if (item.status === 'COMPLETED') {
          done++;
        } else if (!foundCurrentSkill && item.status === 'IN_PROGRESS') {
          foundCurrentSkill = item.catalogItem?.title || item.title;
          foundMilestoneTitle = m.title;
        }
      });
    });

    const progress = total > 0 ? Math.round((done / total) * 100) : 65;

    return {
      title: foundMilestoneTitle,
      currentSkill: foundCurrentSkill || 'GraphQL Microservices & Distributed Caching',
      hoursLeft: Math.max(2, Math.round((total - done) * 4.5)),
      progress
    };
  }, [activeRoadmap]);

  return (
    <div className="space-y-4 w-full text-left">
      
      {/* Bento Grid Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
            ⚡ Bento Grid Architecture
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Real-Time Mouse Spotlight & Moving Border Beams
          </span>
        </div>

        <button
          onClick={() => navigate('/skill-graph')}
          className="text-xs font-bold text-[#5051F9] dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View Prerequisite Graph</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Responsive 4-Card Asymmetric Bento Grid (3 Columns Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* ========================================================================= */}
        {/* CARD 1 (Span 2 cols): Daily Learning Streak & Activity Heatmap */}
        {/* ========================================================================= */}
        <SpotlightCard
          className="lg:col-span-2 flex flex-col justify-between space-y-6"
          spotlightColor="rgba(16, 185, 129, 0.16)"
          borderColor="rgba(16, 185, 129, 0.4)"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Flame className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Daily Learning Streak & Activity Heatmap
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Duolingo-style persistence tracker synchronized with email reminders & study blocks.
              </p>
            </div>

            {/* Streak Counter Badge */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/10 border border-emerald-500/40 text-emerald-400 shadow-sm">
              <span className="text-2xl font-black font-mono tracking-tight">
                🔥 {streakDays}
              </span>
              <div className="text-[10px] leading-tight font-bold">
                <span className="block text-emerald-300 uppercase">Days Active</span>
                <span className="text-slate-400">Streak Shield ON</span>
              </div>
            </div>
          </div>

          {/* 28-Day Heatmap Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Last 4 Weeks Activity ({studyHoursTotal} Total Hours)</span>
              </span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>Less</span>
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-800" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/30" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500/60" />
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                </div>
                <span>More</span>
              </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-1">
              {heatmapDays.map((d, idx) => {
                const colorClass = 
                  d.intensity === 3 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' :
                  d.intensity === 2 ? 'bg-emerald-500/70' :
                  d.intensity === 1 ? 'bg-emerald-500/30' :
                  'bg-slate-200 dark:bg-slate-800/80';

                return (
                  <div
                    key={idx}
                    title={`${d.date}: Level ${d.intensity} Focus`}
                    className={`h-7 rounded-lg transition-transform hover:scale-110 cursor-pointer flex items-center justify-center text-[9px] font-mono font-bold ${colorClass}`}
                  >
                    {d.intensity > 1 && <span className="opacity-70 text-[8px] text-white">✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heatmap Footer Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Top 5% Learner Consistency</span>
            </span>
            <button
              onClick={() => navigate('/planner')}
              className="text-[#5051F9] dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>Sync with Google Calendar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </SpotlightCard>

        {/* ========================================================================= */}
        {/* CARD 2 (Span 1 col): AI Resume Score with Radial Meter */}
        {/* ========================================================================= */}
        <SpotlightCard
          className="relative flex flex-col justify-between space-y-4 overflow-hidden"
          spotlightColor="rgba(6, 182, 212, 0.18)"
          borderColor="rgba(6, 182, 212, 0.45)"
        >
          {/* Subtle Border Beam */}
          <BorderBeam size={160} duration={10} colorFrom="#06B6D4" colorTo="#10B981" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <FileText className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                ATS Resume Score
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              AI Evaluated
            </span>
          </div>

          {/* Circular SVG Radial Meter */}
          <div className="flex items-center justify-center py-2 relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-100 dark:text-slate-800"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="url(#resume-gradient)"
                strokeWidth="10"
                strokeDasharray={`${(resumeScore / 100) * 314} 314`}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="resume-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Score Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {resumeScore}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Strong Technical Impact Found
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              3 quantified bullet rewrites suggested to bridge FAANG hiring criteria.
            </p>
          </div>

          <Button
            onClick={() => navigate('/resume-analyzer')}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-2xl py-2.5 shadow-sm cursor-pointer"
          >
            <span>Analyze Resume Gap &rarr;</span>
          </Button>
        </SpotlightCard>

        {/* ========================================================================= */}
        {/* CARD 3 (Span 1 col): Verified Skill Badges */}
        {/* ========================================================================= */}
        <SpotlightCard
          className="flex flex-col justify-between space-y-4"
          spotlightColor="rgba(245, 158, 11, 0.16)"
          borderColor="rgba(245, 158, 11, 0.4)"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Award className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Verified Skill Badges
              </h3>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Cryptographic
            </span>
          </div>

          {/* Badges Stack */}
          <div className="space-y-2.5">
            {[
              { title: 'React 19 & DAGs', tier: 'Gold Tier', icon: '⚛️', color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-300' },
              { title: 'Topological Prereq Graph', tier: 'Mastery Level 3', icon: '🕸️', color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/40 text-indigo-300' },
              { title: 'Spring Boot Microservices', tier: 'Verified Spec', icon: '🍃', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300' },
            ].map((badge, bIdx) => (
              <div
                key={bIdx}
                className={`p-2.5 rounded-2xl bg-gradient-to-r ${badge.color} border flex items-center justify-between gap-2 shadow-2xs`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{badge.icon}</span>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{badge.title}</h5>
                    <span className="text-[9px] text-slate-400 font-mono">{badge.tier}</span>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/portfolio')}
            className="w-full border-amber-300/40 dark:border-amber-700/50 text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold rounded-2xl py-2 cursor-pointer"
          >
            <span>Shareable Portfolio Badge &rarr;</span>
          </Button>
        </SpotlightCard>

        {/* ========================================================================= */}
        {/* CARD 4 (Span 2 cols): Upcoming Milestone & Next Action Step */}
        {/* ========================================================================= */}
        <SpotlightCard
          className="lg:col-span-2 relative flex flex-col justify-between space-y-5 overflow-hidden"
          spotlightColor="rgba(99, 102, 241, 0.2)"
          borderColor="rgba(99, 102, 241, 0.5)"
        >
          {/* Magic UI Moving Border Beam around Active Milestone */}
          <BorderBeam size={220} duration={6} colorFrom="#5051F9" colorTo="#06B6D4" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  ⚡ Active Sprint Target
                </span>
              </div>
              <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {activeMilestone.title}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>~{activeMilestone.hoursLeft}h remaining</span>
            </div>
          </div>

          {/* Current Focus Highlight Box */}
          <div className="p-4 rounded-2xl bg-[#F8F9FD] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">Current Competency in Progress:</span>
              <span className="text-emerald-500 font-mono">{activeMilestone.progress}% Track Complete</span>
            </div>

            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5051F9] shrink-0" />
              <span>{activeMilestone.currentSkill}</span>
            </h4>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-[#5051F9] via-[#06B6D4] to-[#10B981] transition-all duration-700" 
                style={{ width: `${activeMilestone.progress}%` }}
              />
            </div>
          </div>

          {/* Action Triggers */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <Button
              onClick={() => navigate('/roadmap')}
              className="flex-1 w-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl py-3 shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue Skill Sprint 🚀</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                if (onOpenSandbox) {
                  onOpenSandbox({ title: activeMilestone.currentSkill });
                } else {
                  navigate('/skill-graph');
                }
              }}
              className="w-full sm:w-auto border-indigo-200 dark:border-indigo-800 text-[#5051F9] dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-xs font-bold rounded-2xl py-3 px-5 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Test Out in Sandbox ⚡</span>
            </Button>
          </div>
        </SpotlightCard>

      </div>
    </div>
  );
};

export default PathWiseBentoGrid;
