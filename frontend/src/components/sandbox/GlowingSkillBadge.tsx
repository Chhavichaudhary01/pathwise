import React, { useState } from 'react';
import { ShieldCheck, Copy, Check } from 'lucide-react';

export interface SkillBadgeData {
  id?: string;
  skillName: string;
  topicTitle?: string;
  score: number;
  verificationHash: string;
  badgeTier?: string; // "DIAMOND" | "PLATINUM" | "GOLD"
  issuedAt?: string;
  verificationUrl?: string;
}

interface GlowingSkillBadgeProps {
  badge: SkillBadgeData;
  size?: 'sm' | 'md' | 'lg';
  showVerifyLink?: boolean;
}

export const GlowingSkillBadge: React.FC<GlowingSkillBadgeProps> = ({
  badge,
}) => {
  const [copied, setCopied] = useState(false);

  const tier = badge.badgeTier || (badge.score >= 95 ? 'DIAMOND' : badge.score >= 85 ? 'PLATINUM' : 'GOLD');

  const tierColors = {
    DIAMOND: {
      gradient: 'from-cyan-400 via-indigo-500 to-fuchsia-500',
      pill: 'bg-cyan-950/80 text-cyan-300 border-cyan-400/40',
      glow: 'shadow-[0_0_25px_rgba(6,182,212,0.5)]',
      icon: '💎',
    },
    PLATINUM: {
      gradient: 'from-emerald-400 via-teal-500 to-indigo-500',
      pill: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40',
      glow: 'shadow-[0_0_25px_rgba(16,185,129,0.5)]',
      icon: '⚡',
    },
    GOLD: {
      gradient: 'from-amber-400 via-orange-500 to-yellow-500',
      pill: 'bg-amber-950/80 text-amber-300 border-amber-400/40',
      glow: 'shadow-[0_0_25px_rgba(245,158,11,0.5)]',
      icon: '🏆',
    },
  }[tier] || {
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    pill: 'bg-indigo-950/80 text-indigo-300 border-indigo-400/40',
    glow: 'shadow-[0_0_25px_rgba(99,102,241,0.5)]',
    icon: '✨',
  };

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(badge.verificationHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative group rounded-3xl p-[2px] bg-gradient-to-r ${tierColors.gradient} animate-gradient-xy transition-all duration-300 hover:scale-[1.02] ${tierColors.glow}`}
    >
      {/* Inner Dark Glass Container */}
      <div className="rounded-[22px] bg-slate-950/95 p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between h-full space-y-3">
        
        {/* Top Tier & Score Row */}
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${tierColors.pill}`}>
            <span>{tierColors.icon}</span>
            <span>{tier} Verified</span>
          </span>

          <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
            {badge.score}% Score
          </span>
        </div>

        {/* Badge Title & Topic */}
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight flex items-center gap-1.5">
            <span>{badge.skillName}</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          </h3>
          {badge.topicTitle && (
            <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
              {badge.topicTitle}
            </p>
          )}
        </div>

        {/* Cryptographic Hash & Date */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <button
            type="button"
            onClick={handleCopyHash}
            className="font-mono text-cyan-300/80 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
            title="Click to copy SHA-256 verification hash"
          >
            <span>{badge.verificationHash ? badge.verificationHash.slice(0, 10) + '...' : '0xVerified'}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
          </button>

          <span>
            {badge.issuedAt ? new Date(badge.issuedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified'}
          </span>
        </div>

      </div>
    </div>
  );
};

export default GlowingSkillBadge;
