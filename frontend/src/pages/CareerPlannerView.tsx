import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, CheckCircle2, Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import CalendarExportModal from '@/components/planner/CalendarExportModal';
import api from '@/lib/api';

interface MilestoneSchedule {
  milestoneId: string;
  phaseTitle: string;
  orderIndex: number;
  totalItems: number;
  completedItems: number;
  estimatedHours: number;
  targetStartDate: string;
  targetCompletionDate: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING';
  keyDeliverables: string[];
}

interface StudySession {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  googleCalendarUrl: string;
}

interface TimelineData {
  roadmapTitle: string;
  weeklyHours: number;
  totalEstimatedHours: number;
  completedHours: number;
  remainingHours: number;
  progressPercent: number;
  estimatedWeeksRemaining: number;
  estimatedGraduationDate: string;
  milestoneSchedules: MilestoneSchedule[];
  scheduledStudyBlocks: StudySession[];
  googleCalendarQuickAddUrl?: string;
}

export default function CareerPlannerView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [weeklyHours, setWeeklyHours] = useState<number>(10);
  const [studyPacing, setStudyPacing] = useState<'WEEKDAY_EVENINGS' | 'WEEKEND_SPRINTS' | 'DAILY_BALANCED'>('WEEKDAY_EVENINGS');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [savingPace, setSavingPace] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchTimeline(weeklyHours);
  }, []);

  const fetchTimeline = async (hours?: number) => {
    try {
      setLoading(true);
      const res = await api.get('/schedule/timeline', {
        params: { weeklyHours: hours || weeklyHours }
      });
      setTimeline(res.data);
      if (res.data?.weeklyHours) {
        setWeeklyHours(res.data.weeklyHours);
      }
    } catch (err) {
      console.error('Failed to load career schedule timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (newHours: number) => {
    setWeeklyHours(newHours);
    fetchTimeline(newHours);
  };

  const handleSaveCommitment = async () => {
    try {
      setSavingPace(true);
      await api.post('/schedule/commitment', { weeklyHours });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save commitment:', err);
    } finally {
      setSavingPace(false);
    }
  };

  const graduationDateStr = timeline?.estimatedGraduationDate 
    ? new Date(timeline.estimatedGraduationDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : 'In ~5 Weeks';

  if (loading && !timeline) {
    return (
      <div className="py-32 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#5051F9] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Calculating career timeline & milestone target dates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto pb-16">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#5051F9] border border-purple-200">
              📅 Career Planner & Timeline Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Interactive Career Schedule & Milestone Sync
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Dynamic target dates based on your real weekly commitment. Sync study sprints directly to your personal calendar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setExportModalOpen(true)}
            className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-full px-5 py-2.5 shadow-md cursor-pointer flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-300" />
            <span>Export to Calendar (.ics)</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate('/roadmap')}
            className="rounded-full text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            🕸️ View DAG
          </Button>
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Left Column: Interactive Pace Slider & Pacing Modes (5 cols) */}
        <Card className="lg:col-span-5 border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5051F9]" />
              <span>Weekly Time Commitment</span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Adjust your study pace to instantly recalculate all milestone deadlines and target graduation.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            
            {/* Big Hours Counter */}
            <div className="text-center p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-purple-100 dark:border-indigo-800/50 space-y-1">
              <span className="text-4xl font-black text-[#5051F9] dark:text-indigo-400 font-mono tracking-tight">
                {weeklyHours}
              </span>
              <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 block">
                Hours / Week Commitment
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                ~{(weeklyHours / 7).toFixed(1)} hrs/day average focus
              </span>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>3h/wk (Casual)</span>
                <span>15h/wk (Focused)</span>
                <span>40h/wk (Bootcamp)</span>
              </div>

              <input
                type="range"
                min="3"
                max="40"
                step="1"
                value={weeklyHours}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#5051F9]"
              />
            </div>

            {/* Study Distribution Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                Preferred Study Routine
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'WEEKDAY_EVENINGS', label: '🌆 Evenings', desc: 'Mon-Fri 1-2h' },
                  { id: 'WEEKEND_SPRINTS', label: '⚡ Weekends', desc: 'Sat-Sun 4-5h' },
                  { id: 'DAILY_BALANCED', label: '⚖️ Daily', desc: 'Daily 1.5h' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStudyPacing(item.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      studyPacing === item.id
                        ? 'bg-purple-50 dark:bg-indigo-950/60 border-[#5051F9] text-[#5051F9] dark:text-indigo-300 font-bold shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-xs block font-bold">{item.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Save Commitment Button */}
            <Button
              onClick={handleSaveCommitment}
              disabled={savingPace}
              className="w-full bg-slate-900 dark:bg-[#5051F9] hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl py-2.5 shadow-sm cursor-pointer"
            >
              {saveSuccess ? '✓ Commitment Pace Saved!' : '💾 Save Target Commitment in Profile'}
            </Button>

          </CardContent>
        </Card>

        {/* Right Column: Dynamic Graduation Target & Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Graduation Target Banner */}
          <Card className="border-none shadow-md bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden text-left">
            <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase">
                  🎯 Target Completion Date
                </span>
                <span className="text-xs text-slate-300 font-bold">
                  • {timeline?.estimatedWeeksRemaining || 5} Weeks Remaining
                </span>
              </div>

              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {graduationDateStr}
                </h2>
                <p className="text-xs text-slate-300 max-w-md mt-1">
                  At <strong>{weeklyHours} hrs/week</strong>, you will master all prerequisite milestones and capstone deliverables for <strong>{timeline?.roadmapTitle || 'Full Stack Engineer'}</strong> by this date.
                </p>
              </div>

              {/* Progress Bar Row */}
              <div className="pt-2 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Track Mastery Progress</span>
                  <span>{timeline?.progressPercent || 0}% Completed</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 via-teal-400 to-[#5051F9] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${timeline?.progressPercent || 0}%` }}
                  />
                </div>
              </div>

            </div>
          </Card>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Total Study Hours</span>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100">{Math.round(timeline?.totalEstimatedHours || 45)}h</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Hours Completed</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{Math.round(timeline?.completedHours || 0)}h</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Hours Remaining</span>
              <p className="text-xl font-black text-[#5051F9] dark:text-indigo-400">{Math.round(timeline?.remainingHours || 45)}h</p>
            </div>
          </div>

        </div>

      </div>

      {/* Dynamic Milestone Target Timeline (Gantt Schedule) */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5051F9]" />
              <span>Calculated Milestone Target Dates</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each milestone target is sequenced chronologically based on prerequisite topological order.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setExportModalOpen(true)}
            variant="outline"
            className="text-xs font-bold border-purple-200 dark:border-indigo-800 text-[#5051F9] dark:text-indigo-400 bg-purple-50 dark:bg-indigo-950/60 hover:bg-purple-100 rounded-full cursor-pointer"
          >
            ⚡ Sync All to Calendar
          </Button>
        </div>

        {/* Milestone Schedule Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {timeline?.milestoneSchedules?.map((m, idx) => {
            const isCompleted = m.status === 'COMPLETED';
            const isInProgress = m.status === 'IN_PROGRESS';

            return (
              <Card 
                key={m.milestoneId || idx}
                className={`border rounded-3xl transition-all shadow-sm flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : isInProgress
                    ? 'bg-purple-50/30 dark:bg-indigo-950/30 border-purple-200 dark:border-indigo-800 ring-2 ring-[#5051F9]/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <CardHeader className="p-5 border-b border-slate-100/80 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Phase {m.orderIndex}
                    </span>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : isInProgress
                        ? 'bg-[#EDE9FE] dark:bg-indigo-950/60 text-[#5051F9] dark:text-indigo-300 border-purple-300 dark:border-indigo-700 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {isCompleted ? '✓ Completed' : isInProgress ? '⚡ Active Phase' : 'Upcoming'}
                    </span>
                  </div>

                  <CardTitle className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                    {m.phaseTitle}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-xs">
                  
                  {/* Date Range Badge */}
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Target Start:</span>
                      <strong className="text-slate-800">{new Date(m.targetStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Target Deadline:</span>
                      <strong className="text-[#5051F9] font-extrabold">{new Date(m.targetCompletionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    </div>
                  </div>

                  {/* Key Deliverables */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Key Competency Focus:
                    </span>
                    <div className="space-y-1">
                      {m.keyDeliverables.map((item, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#5051F9] shrink-0" />
                          <span className="line-clamp-1">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Effort */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Est. Effort: ~{Math.round(m.estimatedHours)} Hours</span>
                    <span>{m.totalItems} Modules</span>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Calendar Export Modal */}
      <CalendarExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        roadmapTitle={timeline?.roadmapTitle}
        weeklyHours={weeklyHours}
        graduationDate={timeline?.estimatedGraduationDate}
        quickAddUrl={timeline?.googleCalendarQuickAddUrl}
        studyBlocks={timeline?.scheduledStudyBlocks}
      />

    </div>
  );
}
