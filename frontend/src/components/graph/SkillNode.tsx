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

  // Sleek, lightweight glassmorphic card themes
  const cardTheme = isCompleted
    ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    : isInProgress
    ? 'border-indigo-500/60 bg-indigo-950/25 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/30'
    : 'border-slate-800/80 bg-slate-950/60 text-slate-300 opacity-70 hover:opacity-95 hover:border-slate-700';

  const formatPillTheme = isCompleted
    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    : isInProgress
    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    : 'bg-slate-900 text-slate-400 border-slate-800';

  return (
    <div
      className={`relative group w-56 rounded-2xl p-3 border transition-all duration-200 backdrop-blur-xl cursor-pointer select-none ${cardTheme} ${
        selected ? 'ring-2 ring-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
    >
      {/* Target Connection Socket */}
      <Handle
        type="target"
        position={Position.Left}
        className={`!w-2 !h-2 !-left-1 border transition-all ${
          isCompleted
            ? '!bg-emerald-400 !border-emerald-200 shadow-[0_0_6px_#10b981]'
            : isInProgress
            ? '!bg-cyan-400 !border-white shadow-[0_0_8px_#06b6d4]'
            : '!bg-slate-700 !border-slate-600'
        }`}
      />

      {/* Header Row: Phase Tag & Format */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1 text-[9px] font-mono font-bold tracking-wider text-slate-400">
          <span>P{data.phaseNum}.{data.orderIndex + 1}</span>
          {isInProgress && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          )}
        </div>

        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${formatPillTheme}`}>
          {data.isProject ? 'Project' : data.format || 'Skill'}
        </span>
      </div>

      {/* Main Title & Status Icon */}
      <div className="flex items-start gap-2 mb-2">
        <div className="mt-0.5 shrink-0">
          {isCompleted ? (
            <div className="w-4 h-4 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          ) : isInProgress ? (
            <div className="w-4 h-4 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            </div>
          ) : (
            <div className="w-4 h-4 rounded-md bg-slate-800 flex items-center justify-center text-slate-500">
              <Lock className="w-3 h-3" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold leading-tight line-clamp-2">
            {data.title}
          </h4>
          {data.skills && data.skills.length > 0 && (
            <p className="text-[9px] text-slate-400 truncate mt-0.5 font-mono">
              {data.skills.slice(0, 2).join(' • ')}
            </p>
          )}
        </div>
      </div>

      {/* Compact Meta Footer */}
      <div className="flex items-center justify-between text-[9px] font-medium text-slate-400 pt-1.5 border-t border-white/5">
        <span className="flex items-center gap-1 font-mono text-slate-400">
          <Clock className="w-2.5 h-2.5 text-slate-400" />
          ~{data.estimatedHours || 5}h
        </span>

        {data.salaryMultiplier ? (
          <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30 text-[8px]">
            {data.salaryMultiplier}
          </span>
        ) : (
          <span className="text-[8px] text-slate-400 font-mono">★ 4.9</span>
        )}
      </div>

      {/* Source Connection Socket */}
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-2 !h-2 !-right-1 border transition-all ${
          isCompleted
            ? '!bg-emerald-400 !border-emerald-200 shadow-[0_0_6px_#10b981]'
            : isInProgress
            ? '!bg-cyan-400 !border-white shadow-[0_0_8px_#06b6d4]'
            : '!bg-slate-700 !border-slate-600'
        }`}
      />
    </div>
  );
});

SkillNode.displayName = 'SkillNode';
export default SkillNode;
