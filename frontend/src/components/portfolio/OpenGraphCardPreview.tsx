import React, { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface OpenGraphCardPreviewProps {
  username: string;
  targetRole: string;
  masteryPercent: number;
  streakDays: number;
  verifiedBadgesCount: number;
  vanityUrl: string;
}

export const OpenGraphCardPreview: React.FC<OpenGraphCardPreviewProps> = ({
  username = 'learner',
  targetRole = 'Full Stack Engineer',
  masteryPercent = 85,
  streakDays = 14,
  verifiedBadgesCount = 3,
  vanityUrl = 'http://localhost:5173/@learner',
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(vanityUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = async () => {
    try {
      setDownloading(true);
      const res = await api.get(`/public/og/${username}`, { responseType: 'text' });
      const blob = new Blob([res.data], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${username}-pathwise-card.svg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download OG card:', err);
    } finally {
      setDownloading(false);
    }
  };

  const tweetText = encodeURIComponent(
    `🔥 I'm mastering ${targetRole} on @pathwise! Verified ${masteryPercent}% topological mastery with a ${streakDays}-day streak. Check out my public skill portfolio: ${vanityUrl}`
  );

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(vanityUrl)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-white space-y-6 shadow-2xl">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              OpenGraph Social Engine
            </span>
            <span className="text-[10px] text-slate-400 font-bold">• 1200x630 Social Card</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-white leading-tight">
            Shareable Social Preview Card
          </h3>
        </div>

        {/* Share Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handleShareTwitter}
            className="bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 text-[#1DA1F2] border border-[#1DA1F2]/40 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <span className="font-mono font-black text-xs">𝕏</span>
            <span>Share on X</span>
          </Button>

          <Button
            size="sm"
            onClick={handleShareLinkedIn}
            className="bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 text-[#38BDF8] border border-[#0A66C2]/40 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <span className="font-mono font-black text-xs">in</span>
            <span>Share on LinkedIn</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadSvg}
            disabled={downloading}
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 font-bold text-xs rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>{downloading ? 'Downloading...' : 'Download Card'}</span>
          </Button>
        </div>
      </div>

      {/* Cyberpunk Social Card Visual Representation */}
      <div className="relative rounded-2xl overflow-hidden border border-indigo-500/40 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Glow Spheres in background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-black uppercase tracking-widest text-indigo-400 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30">
                ✦ PATHWISE VERIFIED PORTFOLIO
              </span>
              <div className="flex items-center gap-2 pt-2">
                <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  @{username}
                </h4>
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
                  ✓
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-400">
                {targetRole}
              </p>
            </div>

            <div className="text-right font-mono text-[11px] text-slate-500">
              <span>RFC 5545 • SHA-256</span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Topological Mastery
              </span>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                {masteryPercent}%
              </p>
              <span className="text-[10px] text-emerald-500/80 font-bold block">
                Prerequisite DAG Verified
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Current Streak
              </span>
              <p className="text-2xl font-black text-amber-400 font-mono">
                🔥 {streakDays} Days
              </p>
              <span className="text-[10px] text-amber-500/80 font-bold block">
                Active Study Habit
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Skill Badges
              </span>
              <p className="text-2xl font-black text-cyan-400 font-mono">
                💎 {verifiedBadgesCount} Minted
              </p>
              <span className="text-[10px] text-cyan-500/80 font-bold block">
                Proof-of-Skill Cryptographic
              </span>
            </div>
          </div>

          {/* Bottom Vanity URL Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <span className="font-mono text-slate-400 text-[11px] truncate max-w-sm">
              {vanityUrl}
            </span>

            <button
              type="button"
              onClick={handleCopyLink}
              className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied URL!' : 'Copy Vanity URL'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OpenGraphCardPreview;
