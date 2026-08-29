import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap, ShieldCheck, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BorderBeam } from '@/components/ui/border-beam';

export interface SpotlightHeroProps {
  appName?: string;
  tagline?: string;
  aiEngine?: string;
  database?: string;
  onPrimaryClick?: () => void;
  onDemoClick?: () => void;
  onSecondaryClick?: () => void;
  demoLoading?: boolean;
  isAuthenticated?: boolean;
}

export const SpotlightHero: React.FC<SpotlightHeroProps> = ({
  appName = "PathWise",
  tagline = "Personalized AI-powered career roadmaps, topological skill DAGs, ATS resume audits, and gamified study sprints.",
  aiEngine = "Google Gemini 1.5 Flash",
  database = "Neon PostgreSQL",
  onPrimaryClick,
  onDemoClick,
  onSecondaryClick,
  demoLoading = false,
  isAuthenticated = false,
}) => {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#030712] border border-slate-800 text-white p-8 md:p-14 shadow-2xl my-6">
      
      {/* 1. Ambient Radial & Conic Indigo/Violet Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-950/20 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#5051F9]/20 blur-[100px] pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-[100px] pointer-events-none" />

      {/* 2. Subtle Cyber Grid Mask Pattern */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" 
      />

      {/* Moving SVG Border Beam */}
      <BorderBeam size={300} duration={10} colorFrom="#5051F9" colorTo="#06B6D4" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        
        {/* Dynamic Badge Pills Strip */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>⚡ Engine: {aiEngine}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-sm backdrop-blur-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>DB: {database}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-sm backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Topological DAG Verified</span>
          </div>
        </motion.div>

        {/* Centered High-Impact Typography with Subtle Gradient Mask */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-center"
        >
          <span className="bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Your Autonomous AI Career Navigator
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#5051F9] via-[#818CF8] to-[#06B6D4] bg-clip-text text-transparent">
            {appName}
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          {tagline}
        </motion.p>

        {/* Hero Interactive Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          {isAuthenticated ? (
            <Button
              onClick={onPrimaryClick}
              size="lg"
              className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold text-sm px-8 py-6 rounded-2xl shadow-[0_0_25px_rgba(79,70,229,0.45)] cursor-pointer flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <>
              <Button
                onClick={onPrimaryClick}
                size="lg"
                className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-indigo-600 hover:to-indigo-700 text-white font-extrabold text-sm px-8 py-6 rounded-2xl shadow-[0_0_25px_rgba(79,70,229,0.45)] cursor-pointer flex items-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              {onDemoClick && (
                <Button
                  onClick={onDemoClick}
                  disabled={demoLoading}
                  size="lg"
                  variant="outline"
                  className="bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-100 font-bold text-sm px-6 py-6 rounded-2xl backdrop-blur-md cursor-pointer flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>{demoLoading ? 'Logging In...' : '⚡ Instant Demo Mode'}</span>
                </Button>
              )}
            </>
          )}

          {onSecondaryClick && (
            <Button
              onClick={onSecondaryClick}
              size="lg"
              variant="ghost"
              className="hover:bg-slate-800/60 text-slate-300 hover:text-white font-bold text-sm px-5 py-6 rounded-2xl cursor-pointer flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Explore DAG Graphs</span>
            </Button>
          )}
        </motion.div>

      </div>

    </div>
  );
};

export default SpotlightHero;
