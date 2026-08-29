import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { CheckCircle2, Lock, Zap, Clock, Sparkles } from 'lucide-react';

export interface SkillNodeData {
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
  salaryMultiplier?: string;
  communityRating?: number;
  prerequisites?: string[];
  unlocks?: string[];
  isProject?: boolean;
}

export const SkillNode = memo(({ data, selected }: NodeProps<SkillNodeData>) => {
  const isCompleted = data.status === 'COMPLETED';
  const isInProgress = data.status === 'IN_PROGRESS';

  // 21st.dev Glassmorphic Glow Card Themes
  const cardTheme = isCompleted
    ? 'border-emerald-500/80 bg-gradient-to-br from-emerald-950/90 via-slate-900/95 to-slate-950/90 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
    : isInProgress
    ? 'border-indigo-500/90 bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-purple-950/90 shadow-[0_0_30px_rgba(99,102,241,0.45)] ring-1 ring-indigo-400/50'
    : 'border-slate-800 bg-slate-950/80 hover:border-slate-700 opacity-80 shadow-md';

  const glowAccent = isCompleted
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
    : isInProgress
    ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
    : 'bg-slate-800/80 text-slate-400 border-slate-700';

  return (
    <div
      className={`relative group w-68 rounded-3xl p-4 border transition-all duration-300 backdrop-blur-2xl cursor-pointer select-none ${cardTheme} ${
        selected ? 'ring-2 ring-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.65)] scale-[1.03]' : 'hover:scale-[1.02]'
      }`}
    >
      {/* Animated Target Beam Socket */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3.5 h-3.5 border-2 transition-all ${
          isCompleted
            ? '!bg-emerald-400 !border-emerald-100 shadow-[0_0_12px_#10b981]'
            : isInProgress
            ? '!bg-indigo-400 !border-white shadow-[0_0_12px_#6366f1] animate-pulse'
            : '!bg-slate-700 !border-slate-500'
        }`}
      />

      {/* Top Header Row: Phase Tag & Format Pill */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-black tracking-wider text-slate-400 uppercase">
            Phase {data.phaseNum} • #{data.orderIndex + 1}
          </span>
          {isInProgress && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          )}
        </div>

        <span
          className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${glowAccent}`}
        >
          {data.isProject ? '🛠️ Project Start' : data.format || '📘 Skill'}
        </span>
      </div>

      {/* Main Title & Status Beacon */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="mt-0.5 shrink-0">
          {isCompleted ? (
            <div className="w-6 h-6 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/40 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          ) : isInProgress ? (
            <div className="w-6 h-6 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-400/50 shadow-[0_0_10px_rgba(99,102,241,0.4)]">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-bounce" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 border border-slate-700/80">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={`text-xs font-bold leading-snug line-clamp-2 ${
              isCompleted
                ? 'text-emerald-100'
                : isInProgress
                ? 'text-white'
                : 'text-slate-300'
            }`}
          >
            {data.title}
          </h4>
          {data.skills && data.skills.length > 0 && (
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {data.skills.slice(0, 2).join(' • ')}
            </p>
          )}
        </div>
      </div>

      {/* Meta Footer: Hours & Salary Multiplier */}
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 pt-2 border-t border-white/10">
        <span className="flex items-center gap-1 text-slate-400 font-mono">
          <Clock className="w-3 h-3 text-slate-400" />
          ~{data.estimatedHours || 5}h
        </span>

        {data.salaryMultiplier ? (
          <span className="font-mono text-cyan-300 font-bold bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-500/40 text-[9px] shadow-xs">
            {data.salaryMultiplier}
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>Verified</span>
          </span>
        )}

        <span className="text-[10px] font-semibold text-slate-400">
          ★ {data.communityRating ? data.communityRating.toFixed(1) : '4.9'}
        </span>
      </div>

      {/* Output source handle (to downstream skills) */}
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3.5 h-3.5 border-2 transition-all ${
          isCompleted
            ? '!bg-emerald-400 !border-emerald-100 shadow-[0_0_12px_#10b981]'
            : isInProgress
            ? '!bg-indigo-400 !border-white shadow-[0_0_12px_#6366f1] animate-pulse'
            : '!bg-slate-700 !border-slate-500'
        }`}
      />
    </div>
  );
});

SkillNode.displayName = 'SkillNode';
export default SkillNode;
