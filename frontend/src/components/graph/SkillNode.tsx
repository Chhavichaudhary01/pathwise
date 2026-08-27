import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { CheckCircle2, Lock, Zap, Clock } from 'lucide-react';

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

  // Dynamic visual themes
  const cardBorder = isCompleted
    ? 'border-emerald-400 bg-gradient-to-br from-emerald-950/80 via-slate-900/90 to-emerald-950/60 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
    : isInProgress
    ? 'border-indigo-400 bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-purple-950/80 shadow-[0_0_24px_rgba(99,102,241,0.45)] ring-2 ring-indigo-400/40 animate-pulse-subtle'
    : 'border-slate-700/80 bg-slate-900/80 hover:border-slate-500/80 opacity-75 shadow-lg';

  const glowAccent = isCompleted
    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    : isInProgress
    ? 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40'
    : 'bg-slate-800/80 text-slate-400 border-slate-700';

  return (
    <div
      className={`relative group w-64 rounded-2xl p-4 border transition-all duration-300 backdrop-blur-xl cursor-pointer ${cardBorder} ${
        selected ? 'ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] scale-[1.03]' : ''
      }`}
    >
      {/* Target input handle (from prerequisites) */}
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 border-2 transition-colors ${
          isCompleted
            ? '!bg-emerald-400 !border-emerald-200 shadow-[0_0_10px_#10b981]'
            : isInProgress
            ? '!bg-indigo-400 !border-white shadow-[0_0_10px_#6366f1]'
            : '!bg-slate-700 !border-slate-500'
        }`}
      />

      {/* Top Header Row: Phase Tag & Format Pill */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          Phase {data.phaseNum} • #{data.orderIndex + 1}
        </span>

        <span
          className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${glowAccent}`}
        >
          {data.isProject ? '🛠️ Project Start' : data.format || '📘 Skill'}
        </span>
      </div>

      {/* Main Title & Status Icon */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="mt-0.5 shrink-0">
          {isCompleted ? (
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          ) : isInProgress ? (
            <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-400/50 animate-spin-slow">
              <Zap className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
              <Lock className="w-3 h-3" />
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
        </div>
      </div>

      {/* Meta Footer: Hours & Salary Multiplier */}
      <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 pt-2 border-t border-white/5">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          ~{data.estimatedHours || 5}h
        </span>

        {data.salaryMultiplier && (
          <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {data.salaryMultiplier}
          </span>
        )}

        <span className="text-[10px] font-semibold text-slate-400">
          ★ {data.communityRating ? data.communityRating.toFixed(1) : '4.9'}
        </span>
      </div>

      {/* Hover action hint */}
      <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="bg-slate-950/90 text-cyan-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/40 shadow-lg whitespace-nowrap">
          Click for Skill HUD &rarr;
        </span>
      </div>

      {/* Output source handle (to downstream skills) */}
      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 border-2 transition-colors ${
          isCompleted
            ? '!bg-emerald-400 !border-emerald-200 shadow-[0_0_10px_#10b981]'
            : isInProgress
            ? '!bg-indigo-400 !border-white shadow-[0_0_10px_#6366f1]'
            : '!bg-slate-700 !border-slate-500'
        }`}
      />
    </div>
  );
});

SkillNode.displayName = 'SkillNode';
export default SkillNode;
