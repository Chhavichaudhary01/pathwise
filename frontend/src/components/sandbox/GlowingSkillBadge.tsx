import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, Lock, Sparkles } from 'lucide-react';
import { ShineBorder } from '@/components/ui/shine-border';
import { cn } from '@/lib/utils';

export interface SkillBadgeData {
  id?: string;
  skillName: string;
  topicTitle?: string;
  score?: number;
  verificationHash?: string;
  badgeTier?: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'MASTER' | 'PRO' | 'VERIFIED' | 'STANDARD' | string;
  issuedAt?: string;
  verificationUrl?: string;
  category?: string;
  level?: number;
  issuer?: string;
  isVerified?: boolean;
}

export interface GlowingSkillBadgeProps {
  badge?: SkillBadgeData;
  // Direct flat props for backwards compatibility
  skillName?: string;
  category?: string;
  level?: number;
  tier?: 'DIAMOND' | 'PLATINUM' | 'GOLD' | 'MASTER' | 'PRO' | 'VERIFIED' | 'STANDARD' | string;
  verifiedDate?: string;
  issuer?: string;
  credentialId?: string;
  isVerified?: boolean;
  score?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showVerifyLink?: boolean;
  className?: string;
}

export const GlowingSkillBadge: React.FC<GlowingSkillBadgeProps> = ({
  badge,
  skillName: flatSkillName,
  category: flatCategory,
  level: flatLevel,
  tier: flatTier,
  verifiedDate: flatVerifiedDate,
  issuer: flatIssuer,
  credentialId: flatCredentialId,
  isVerified: flatIsVerified,
  score: flatScore,
  onClick,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  // Normalize data between structured badge object and flat props
  const name = badge?.skillName || flatSkillName || 'Verified Competency';
  const category = badge?.category || flatCategory || badge?.topicTitle || 'Engineering Spec';
  const verified = badge?.isVerified !== undefined ? badge.isVerified : flatIsVerified !== undefined ? flatIsVerified : true;
  const score = badge?.score ?? flatScore ?? 92;
  const level = badge?.level ?? flatLevel ?? 1;
  const rawTier = badge?.badgeTier || flatTier || (level >= 3 ? 'PLATINUM' : score >= 95 ? 'DIAMOND' : score >= 85 ? 'PLATINUM' : 'GOLD');
  const normalizedTier = String(rawTier).toUpperCase();
  const date = badge?.issuedAt || flatVerifiedDate || 'Aug 2026';
  const issuerName = badge?.issuer || flatIssuer || 'PathWise AI DAG Authority';
  const hash = badge?.verificationHash || flatCredentialId || `pw_${Math.random().toString(36).substring(2, 9)}`;

  // Dynamic Tier Palettes
  const tierConfig = {
    DIAMOND: {
      shineColors: ['#06B6D4', '#6366F1', '#EC4899'],
      pill: 'bg-cyan-950/80 text-cyan-300 border-cyan-400/40',
      glowShadow: 'shadow-[0_0_30px_rgba(6,182,212,0.35)]',
      icon: '💎',
      accentText: 'text-cyan-400',
    },
    MASTER: {
      shineColors: ['#F59E0B', '#FCD34D', '#EA580C'],
      pill: 'bg-amber-950/80 text-amber-300 border-amber-400/40',
      glowShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.35)]',
      icon: '🏆',
      accentText: 'text-amber-400',
    },
    GOLD: {
      shineColors: ['#F59E0B', '#FBBF24', '#D97706'],
      pill: 'bg-amber-950/80 text-amber-300 border-amber-400/40',
      glowShadow: 'shadow-[0_0_30px_rgba(245,158,11,0.35)]',
      icon: '🥇',
      accentText: 'text-amber-400',
    },
    PLATINUM: {
      shineColors: ['#06B6D4', '#3B82F6', '#8B5CF6'],
      pill: 'bg-indigo-950/80 text-indigo-300 border-indigo-400/40',
      glowShadow: 'shadow-[0_0_30px_rgba(99,102,241,0.35)]',
      icon: '⚡',
      accentText: 'text-indigo-400',
    },
    PRO: {
      shineColors: ['#06B6D4', '#6366F1', '#A855F7'],
      pill: 'bg-indigo-950/80 text-indigo-300 border-indigo-400/40',
      glowShadow: 'shadow-[0_0_30px_rgba(99,102,241,0.35)]',
      icon: '⚡',
      accentText: 'text-indigo-400',
    },
    VERIFIED: {
      shineColors: ['#10B981', '#06B6D4', '#3B82F6'],
      pill: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40',
      glowShadow: 'shadow-[0_0_30px_rgba(16,185,129,0.35)]',
      icon: '✓',
      accentText: 'text-emerald-400',
    },
    STANDARD: {
      shineColors: ['#10B981', '#06B6D4', '#3B82F6'],
      pill: 'bg-emerald-950/80 text-emerald-300 border-emerald-400/40',
      glowShadow: 'shadow-[0_0_25px_rgba(16,185,129,0.25)]',
      icon: '✓',
      accentText: 'text-emerald-400',
    },
  }[normalizedTier] || {
    shineColors: ['#6366F1', '#8B5CF6', '#EC4899'],
    pill: 'bg-slate-900 text-slate-300 border-slate-700',
    glowShadow: 'shadow-[0_0_25px_rgba(99,102,241,0.25)]',
    icon: '✨',
    accentText: 'text-indigo-400',
  };

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. INACTIVE / UNVERIFIED FALLBACK
  if (!verified) {
    return (
      <div
        onClick={onClick}
        className={cn(
          'relative rounded-3xl border border-slate-800 bg-slate-950/60 p-5 backdrop-blur-md opacity-60 transition-all hover:opacity-80 select-none text-left',
          onClick && 'cursor-pointer',
          className
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Unverified Prerequisite</span>
          </span>
          <span className="text-[10px] text-slate-500 font-mono">0% Verified</span>
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-400">{name}</h4>
          <p className="text-[11px] text-slate-500 line-clamp-1">{category}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Complete Milestone to Unlock</span>
          <span>🔒 Locked</span>
        </div>
      </div>
    );
  }

  // 2. ACTIVE VERIFIED BADGE WITH 21st.dev SHINE BORDER ANIMATION
  return (
    <div
      onClick={onClick}
      className={cn(
        'group transition-all duration-300 hover:scale-[1.02] cursor-pointer select-none text-left',
        tierConfig.glowShadow,
        className
      )}
    >
      <ShineBorder
        borderRadius={24}
        borderWidth={1.5}
        duration={12}
        shineColor={tierConfig.shineColors}
        className="w-full bg-gradient-to-b from-slate-900/90 to-slate-950/95 p-5 md:p-6 backdrop-blur-2xl border border-slate-800/80 hover:border-slate-700/80"
      >
        {/* Subtle Ambient Radial Glow */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
          style={{ background: tierConfig.shineColors[0] }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
          
          {/* Badge Header: Tier Icon, Verification Badge, and Score */}
          <div className="flex items-center justify-between gap-2">
            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-xs ${tierConfig.pill}`}>
              <span className="text-xs">{tierConfig.icon}</span>
              <span>{normalizedTier} Verified</span>
            </span>

            <div className="flex items-center gap-1 text-xs font-mono font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-xl border border-emerald-500/30 shadow-xs">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{score}% Mastery</span>
            </div>
          </div>

          {/* Badge Body: Skill Name & Category */}
          <div className="space-y-1">
            <h3 className="text-base font-black text-white leading-snug flex items-center gap-2 group-hover:text-cyan-200 transition-colors">
              <span>{name}</span>
              <ShieldCheck className={`w-4 h-4 shrink-0 ${tierConfig.accentText}`} />
            </h3>
            <p className="text-xs text-slate-400 font-medium line-clamp-1">
              {category}
            </p>
          </div>

          {/* Badge Footer: Cryptographic Hash & Issuance Metadata */}
          <div className="pt-3 border-t border-slate-800/90 flex items-center justify-between text-[10px] text-slate-400">
            <button
              type="button"
              onClick={handleCopyHash}
              className="font-mono text-cyan-300/90 hover:text-cyan-200 flex items-center gap-1.5 cursor-pointer bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-800 hover:border-cyan-500/40 transition-all"
              title="Click to copy SHA-256 cryptographic verification token"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-300 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-cyan-400" />
                  <span>{hash.substring(0, 10)}...</span>
                </>
              )}
            </button>

            <span className="font-mono text-slate-400">
              {date} • {issuerName.split(' ')[0]}
            </span>
          </div>

        </div>
      </ShineBorder>
    </div>
  );
};

/**
 * Preview Showcase Wrapper for Demonstration of Tiers
 */
export const GlowingSkillBadgePreview: React.FC = () => {
  const sampleBadges: SkillBadgeData[] = [
    {
      skillName: 'React 19 & Topological DAGs',
      topicTitle: 'Full-Stack Frontend Architecture',
      score: 98,
      badgeTier: 'DIAMOND',
      verificationHash: '0x8f3c7e91a2b4d5e6f7a8b9c0d1e2f3a4',
      issuedAt: 'Aug 2026',
      isVerified: true
    },
    {
      skillName: 'Spring Boot Microservices',
      topicTitle: 'Distributed Systems & Cloud Deploy',
      score: 91,
      badgeTier: 'PLATINUM',
      verificationHash: '0x7e2d1c9b8a7f6e5d4c3b2a1f0e9d8c7b',
      issuedAt: 'Aug 2026',
      isVerified: true
    },
    {
      skillName: 'PostgreSQL & Neon Lakebase',
      topicTitle: 'Relational Database Optimization',
      score: 86,
      badgeTier: 'GOLD',
      verificationHash: '0x6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a',
      issuedAt: 'Aug 2026',
      isVerified: true
    },
    {
      skillName: 'Kubernetes & Docker Swarm',
      topicTitle: 'Infrastructure Orchestration',
      score: 0,
      badgeTier: 'STANDARD',
      isVerified: false
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {sampleBadges.map((badge, idx) => (
        <GlowingSkillBadge key={idx} badge={badge} />
      ))}
    </div>
  );
};

export default GlowingSkillBadge;
