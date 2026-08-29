import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Lock, 
  Zap, 
  Clock, 
  Sparkles, 
  BookOpen, 
  MessageSquare,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SkillItem {
  id: string;
  title: string;
  phaseNum: number;
  phaseTitle: string;
  orderIndex: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'NOT_STARTED';
  format?: string;
  difficulty?: string;
  estimatedHours?: number;
  skills?: string[];
  description?: string;
  aiExplanation?: string;
  url?: string;
  isProject?: boolean;
}

interface AnimatedBeamSkillTreeProps {
  roadmapTitle?: string;
  milestones?: Array<{
    id?: string;
    title: string;
    description?: string;
    orderIndex: number;
    items: Array<{
      id: string;
      status: string;
      aiExplanation?: string;
      catalogItem?: {
        id?: string;
        title: string;
        description?: string;
        format?: string;
        difficulty?: string;
        estimatedHours?: number;
        url?: string;
        skills?: string[];
      };
    }>;
  }>;
  onItemStatusChange?: (itemId: string, currentStatus: string, newStatus: string) => void;
  onTestOut?: (skill: SkillItem) => void;
}

export default function AnimatedBeamSkillTree({
  roadmapTitle = 'Career Learning Path',
  milestones = [],
  onItemStatusChange,
  onTestOut
}: AnimatedBeamSkillTreeProps) {
  const navigate = useNavigate();
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [activePhaseFilter, setActivePhaseFilter] = useState<number | 'ALL'>('ALL');

  // Flatten milestones into structured skill nodes with topological sequence
  const skillNodes = useMemo<SkillItem[]>(() => {
    const list: SkillItem[] = [];

    milestones.forEach((m, mIdx) => {
      const phaseNum = mIdx + 1;
      const cleanPhaseTitle = m.title || `Phase ${phaseNum}`;
      const isPrevPhaseDone = mIdx === 0 || (
        milestones[mIdx - 1]?.items?.every(it => it.status === 'COMPLETED') ?? false
      );

      (m.items || []).forEach((item, iIdx) => {
        const catItem = item.catalogItem || ({} as any);
        const isCompleted = item.status === 'COMPLETED';
        const isInProgress = item.status === 'IN_PROGRESS';

        let derivedStatus: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' = 'LOCKED';
        if (isCompleted) {
          derivedStatus = 'COMPLETED';
        } else if (isInProgress) {
          derivedStatus = 'IN_PROGRESS';
        } else {
          if (isPrevPhaseDone && (iIdx === 0 || m.items[iIdx - 1]?.status === 'COMPLETED')) {
            derivedStatus = 'IN_PROGRESS';
          } else {
            derivedStatus = 'LOCKED';
          }
        }

        const isProject = catItem.format === 'PROJECT' || iIdx === 0;

        list.push({
          id: item.id || `node-${mIdx}-${iIdx}`,
          title: catItem.title || `Skill ${phaseNum}.${iIdx + 1}`,
          phaseNum,
          phaseTitle: cleanPhaseTitle,
          orderIndex: iIdx,
          status: derivedStatus,
          format: catItem.format || (isProject ? 'PROJECT' : 'COURSE'),
          difficulty: catItem.difficulty || 'Intermediate',
          estimatedHours: catItem.estimatedHours || (isProject ? 8 : 5),
          skills: catItem.skills || [],
          description: catItem.description || item.aiExplanation,
          aiExplanation: item.aiExplanation,
          url: catItem.url,
          isProject
        });
      });
    });

    return list;
  }, [milestones]);

  const selectedSkill = useMemo(() => {
    if (!selectedSkillId) return skillNodes[0] || null;
    return skillNodes.find(s => s.id === selectedSkillId) || skillNodes[0] || null;
  }, [selectedSkillId, skillNodes]);

  // Statistics
  const stats = useMemo(() => {
    const total = skillNodes.length;
    const completed = skillNodes.filter(s => s.status === 'COMPLETED').length;
    const inProgress = skillNodes.filter(s => s.status === 'IN_PROGRESS').length;
    const locked = skillNodes.filter(s => s.status === 'LOCKED').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, locked, percent };
  }, [skillNodes]);

  const filteredNodes = useMemo(() => {
    if (activePhaseFilter === 'ALL') return skillNodes;
    return skillNodes.filter(s => s.phaseNum === activePhaseFilter);
  }, [activePhaseFilter, skillNodes]);

  // Group nodes by phase for column layout
  const phaseGroups = useMemo(() => {
    const map = new Map<number, SkillItem[]>();
    filteredNodes.forEach(n => {
      const arr = map.get(n.phaseNum) || [];
      arr.push(n);
      map.set(n.phaseNum, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filteredNodes]);

  const handleToggleStatus = (node: SkillItem) => {
    if (!onItemStatusChange) return;
    const nextStatus = node.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
    onItemStatusChange(node.id, node.status, nextStatus);
  };

  return (
    <div className="space-y-6 w-full text-left select-none">
      
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              ⚡ 21st.dev Animated Node Tree
            </span>
            <span className="text-xs text-slate-400">
              {stats.completed} of {stats.total} Mastered ({stats.percent}%)
            </span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-white tracking-tight">
            {roadmapTitle}
          </h2>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActivePhaseFilter('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePhaseFilter === 'ALL'
                ? 'bg-[#5051F9] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Tracks
          </button>
          {milestones.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhaseFilter(idx + 1)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePhaseFilter === idx + 1
                  ? 'bg-[#5051F9] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Phase {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Section: Node Tree on Left, Skill HUD Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Animated Connecting Node Flow Canvas (8 cols) */}
        <div className="lg:col-span-8 p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#0B0F19] to-[#030712] border border-slate-800/90 shadow-2xl relative overflow-hidden min-h-[560px]">
          
          {/* Ambient Cyber Grid & Glow Orbs */}
          <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

          {/* Phase Columns Flow */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {phaseGroups.map(([phaseNum, nodes]) => (
              <div key={phaseNum} className="space-y-4">
                
                {/* Column Phase Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-black text-xs flex items-center justify-center">
                    {phaseNum}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide uppercase">
                      {nodes[0]?.phaseTitle ? nodes[0].phaseTitle.split(':')[0] : `Phase ${phaseNum}`}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {nodes.filter(n => n.status === 'COMPLETED').length}/{nodes.length} Done
                    </p>
                  </div>
                </div>

                {/* Node Cards in this Phase */}
                <div className="space-y-4">
                  {nodes.map((node, nodeIdx) => {
                    const isCompleted = node.status === 'COMPLETED';
                    const isInProgress = node.status === 'IN_PROGRESS';
                    const isSelected = selectedSkill?.id === node.id;

                    return (
                      <div key={node.id} className="relative group">
                        
                        {/* Connecting Animated Beam to Next Node (if any) */}
                        {nodeIdx < nodes.length - 1 && (
                          <div className="absolute left-6 top-full h-4 w-0.5 -translate-x-1/2 z-0 overflow-hidden">
                            <div 
                              className={`w-full h-full ${
                                isCompleted 
                                  ? 'bg-gradient-to-b from-emerald-500 to-teal-400 shadow-[0_0_8px_#10b981]' 
                                  : isInProgress 
                                  ? 'bg-gradient-to-b from-indigo-500 to-purple-500 animate-pulse' 
                                  : 'bg-slate-800'
                              }`}
                            />
                          </div>
                        )}

                        {/* Node Card */}
                        <div
                          onClick={() => setSelectedSkillId(node.id)}
                          className={`
                            relative z-10 p-4 rounded-2xl border transition-all duration-300 backdrop-blur-xl cursor-pointer
                            ${isCompleted
                              ? 'bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-slate-950/80 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                              : isInProgress
                              ? 'bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-purple-950/80 border-indigo-500/70 shadow-[0_0_25px_rgba(99,102,241,0.35)] ring-1 ring-indigo-400/40'
                              : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 opacity-75'}
                            ${isSelected ? 'ring-2 ring-cyan-400 scale-[1.02] shadow-[0_0_30px_rgba(6,182,212,0.5)]' : 'hover:scale-[1.01]'}
                          `}
                        >
                          {/* Top Row: Type & Status */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : isInProgress
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {node.isProject ? '🛠️ Project Start' : node.format || 'Course'}
                            </span>

                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                              <Clock className="w-3 h-3" />
                              <span>{node.estimatedHours}h</span>
                            </div>
                          </div>

                          {/* Main Title & Status Beacon */}
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 shrink-0">
                              {isCompleted ? (
                                <div className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </div>
                              ) : isInProgress ? (
                                <div className="w-5 h-5 rounded-lg bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center text-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]">
                                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                                  <Lock className="w-3 h-3" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h5 className={`text-xs font-bold leading-snug line-clamp-2 ${
                                isCompleted ? 'text-emerald-100' : isInProgress ? 'text-white' : 'text-slate-300'
                              }`}>
                                {node.title}
                              </h5>
                            </div>
                          </div>

                          {/* Active Pulsing Light Bar on Current Nodes */}
                          {isInProgress && (
                            <div className="mt-2.5 pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[10px] text-indigo-300 font-bold">
                              <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping inline-block" />
                                Active Target
                              </span>
                              <span>Click to Inspect &rarr;</span>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Node Inspector HUD Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedSkill ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 text-left text-white animate-in fade-in duration-200">
              
              {/* Header Badge Strip */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  selectedSkill.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : selectedSkill.status === 'IN_PROGRESS'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {selectedSkill.status === 'COMPLETED' ? '✓ Mastered' : selectedSkill.status === 'IN_PROGRESS' ? '⚡ In Progress' : '🔒 Locked Prerequisite'}
                </span>

                <span className="text-[10px] font-mono text-slate-400">
                  Phase {selectedSkill.phaseNum} • ~{selectedSkill.estimatedHours}h
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-white leading-snug">
                  {selectedSkill.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {selectedSkill.description || 'Prerequisite milestone designed to establish foundational mental models and syntax mastery.'}
                </p>
              </div>

              {/* Sequencing AI Rationale */}
              {selectedSkill.aiExplanation && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Topological Sequencing Rationale</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                    {selectedSkill.aiExplanation}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => handleToggleStatus(selectedSkill)}
                  className={`w-full py-3 text-xs font-black rounded-2xl shadow-md transition-all cursor-pointer ${
                    selectedSkill.status === 'COMPLETED'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      : 'bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-emerald-600 hover:to-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                  }`}
                >
                  {selectedSkill.status === 'COMPLETED' ? 'Mark Incomplete' : '✓ Mark Milestone Completed'}
                </Button>

                {onTestOut && (
                  <Button
                    onClick={() => onTestOut(selectedSkill)}
                    className="w-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-2xl py-2.5 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Test Out in AI Sandbox</span>
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/learn/${encodeURIComponent(selectedSkill.title)}`)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3 h-3 text-[#5051F9]" />
                    <span>In-App Guide</span>
                  </button>

                  <button
                    onClick={() => navigate('/chat', {
                      state: { initialMessage: `Can you explain the key concepts and hands-on examples for ${selectedSkill.title}?` }
                    })}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                    <span>Ask AI Coach</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
              Click any milestone node to inspect competencies and start study sprints.
            </div>
          )}

          {/* Gamified Achievement Pill */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-400/30 text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-300">
                Verified Skill DAG Certification
              </h4>
              <p className="text-[10px] text-slate-400">
                Complete active beam tracks to unlock cryptographic portfolio badges.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
