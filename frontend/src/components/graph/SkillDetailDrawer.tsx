import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Clock, TrendingUp, Star, 
  Sparkles, ArrowRight, ShieldCheck, BookOpen, Layers, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SkillNodeData } from './SkillNode';

interface SkillDetailDrawerProps {
  skill: SkillNodeData | null;
  onClose: () => void;
  onStatusChange: (nodeId: string, currentStatus: string, newStatus: string) => void;
  onAskAi?: (topic: string) => void;
  onTestOut?: (skill: SkillNodeData) => void;
}

export const SkillDetailDrawer: React.FC<SkillDetailDrawerProps> = ({
  skill,
  onClose,
  onStatusChange,
  onAskAi,
  onTestOut
}) => {
  const navigate = useNavigate();
  if (!skill) return null;

  const isCompleted = skill.status === 'COMPLETED';
  const isInProgress = skill.status === 'IN_PROGRESS';

  // Difficulty color scale
  const difficultyMeter = 
    skill.difficulty?.toLowerCase() === 'advanced' ? 3 :
    skill.difficulty?.toLowerCase() === 'intermediate' ? 2 : 1;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 md:w-[440px] bg-slate-950/95 border-l border-slate-800 backdrop-blur-2xl shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300 animate-in slide-in-from-right">
      
      {/* Drawer Top Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-start justify-between gap-4 bg-gradient-to-b from-slate-900/80 to-slate-950/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Phase {skill.phaseNum}: {skill.phaseTitle}
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              #{skill.orderIndex + 1}
            </span>
          </div>
          <h3 className="text-lg font-black text-white tracking-tight leading-snug">
            {skill.title}
          </h3>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-200">
        
        {/* Status Switcher Banner */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Current Mastery State
            </span>
            <span className={`text-xs font-black uppercase px-2.5 py-1 rounded-full border ${
              isCompleted 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : isInProgress
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {isCompleted ? '✓ Mastered' : isInProgress ? '⚡ In Progress' : '🔒 Locked / Up Next'}
            </span>
          </div>

          {/* Test Out in Sandbox CTA */}
          {onTestOut && !isCompleted && (
            <Button
              size="sm"
              onClick={() => onTestOut(skill)}
              className="w-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5 py-2.5"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>⚡ Test Out & Verify in Micro-Sandbox</span>
            </Button>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onStatusChange(skill.id, skill.status, isCompleted ? 'NOT_STARTED' : 'COMPLETED')}
              className={`flex-1 font-bold text-xs rounded-xl cursor-pointer ${
                isCompleted
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              }`}
            >
              {isCompleted ? 'Mark Incomplete' : '✓ Mark Mastered'}
            </Button>

            {!isCompleted && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(skill.id, skill.status, isInProgress ? 'NOT_STARTED' : 'IN_PROGRESS')}
                className={`font-bold text-xs rounded-xl border-slate-700 hover:bg-slate-800 cursor-pointer ${
                  isInProgress ? 'text-indigo-300 border-indigo-500/50' : 'text-slate-300'
                }`}
              >
                {isInProgress ? 'Pause' : '⚡ Start Working'}
              </Button>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Estimated Hours */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Est. Effort</span>
            </div>
            <p className="text-base font-extrabold text-white">
              ~{skill.estimatedHours || 5} Hours
            </p>
            <span className="text-[10px] text-slate-400">Paced for mastery</span>
          </div>

          {/* Salary Impact */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Career Impact</span>
            </div>
            <p className="text-base font-extrabold text-cyan-300 font-mono">
              {skill.salaryMultiplier || '+15%'}
            </p>
            <span className="text-[10px] text-cyan-400/80 font-medium">Market multiplier</span>
          </div>

          {/* Difficulty Level */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Complexity</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-2 flex-1 rounded-full ${
                    lvl <= difficultyMeter ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase">
              {skill.difficulty || 'Intermediate'}
            </span>
          </div>

          {/* Community Rating */}
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>Community</span>
            </div>
            <p className="text-base font-extrabold text-white">
              {skill.communityRating ? skill.communityRating.toFixed(1) : '4.9'} / 5.0
            </p>
            <span className="text-[10px] text-slate-400">1,240+ reviews</span>
          </div>

        </div>

        {/* AI Sequencing Rationale */}
        {skill.aiExplanation && (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Why This is Placed Here</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {skill.aiExplanation}
            </p>
          </div>
        )}

        {/* Skill Description */}
        {skill.description && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Topic Overview
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {skill.description}
            </p>
          </div>
        )}

        {/* Tags / Subskills */}
        {skill.skills && skill.skills.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Core Competencies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {skill.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300 font-mono"
                >
                  #{s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Verified Links & Documentation */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Verified Learning Resources
          </h4>
          
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/learn/${encodeURIComponent(skill.title)}`, {
                  state: {
                    topic: skill.title,
                    itemId: skill.id
                  }
                });
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Open PathWise Interactive Resource Guide</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {onAskAi && (
              <button
                type="button"
                onClick={() => onAskAi(skill.title)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/50 text-indigo-200 text-xs font-bold transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                  <span>Ask PathWise AI Tutor about this</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Topologically Verified
        </span>
        <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white text-xs">
          Close HUD
        </Button>
      </div>

    </div>
  );
};

export default SkillDetailDrawer;
