import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/ThemeToggle';
import SpotlightHero from '@/components/ui/spotlight-hero';
import api from '@/lib/api';

interface LandingData {
  appName: string;
  tagline: string;
  aiEngine: string;
  database: string;
  totalCatalogItems: number;
  totalSkillsCovered: number;
  tracks: string[];
  status: string;
}

export default function Landing() {
  const { user, isAuthenticated, loginDemo, logout } = useAuthStore();
  const [meta, setMeta] = useState<LandingData | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/landing')
      .then(res => setMeta(res.data))
      .catch(() => {
        setMeta({
          appName: 'PathWise',
          tagline: 'AI-Powered Personalized Career & Learning Path Recommender',
          aiEngine: 'Google Gemini 1.5 Flash',
          database: 'Neon PostgreSQL',
          totalCatalogItems: 60,
          totalSkillsCovered: 14,
          tracks: ['Frontend Developer', 'Data Analyst', 'Machine Learning Engineer', 'Product Manager', 'Digital Marketer'],
          status: 'ONLINE',
        });
      });
  }, []);

  const handleInstantDemo = async () => {
    setDemoLoading(true);
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      navigate('/dashboard');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="max-w-5xl w-full text-center space-y-6">
        
        {/* Top User Bar */}
        <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur-md border border-slate-800 px-5 py-2.5 rounded-full shadow-lg max-w-xl mx-auto text-xs">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold text-slate-200">Signed in as {user.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ThemeToggle />
                <button onClick={logout} className="text-slate-400 hover:text-rose-400 font-bold cursor-pointer transition-colors">
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5051F9] animate-pulse"></span>
                <span className="font-semibold text-slate-200">PathWise AI Platform</span>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-[#5051F9] text-white px-3.5 py-1 rounded-full font-bold hover:bg-indigo-600 transition-colors shadow-xs">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>

        {/* 21st.dev Spotlight Hero Component */}
        <SpotlightHero
          appName={meta?.appName || 'PathWise'}
          tagline={meta?.tagline || "Tell us where you want to go. We'll generate a personalized, prerequisite-resolved roadmap to get you there—step by step."}
          aiEngine={meta?.aiEngine || 'Google Gemini 1.5 Flash'}
          database={meta?.database || 'Neon PostgreSQL'}
          isAuthenticated={isAuthenticated}
          onPrimaryClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
          onDemoClick={handleInstantDemo}
          onSecondaryClick={() => navigate('/skill-graph')}
          demoLoading={demoLoading}
        />

        {/* Platform Capability Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md shadow-sm">
            <CardContent className="p-5 space-y-1.5">
              <span className="text-xl">🕸️</span>
              <h3 className="font-bold text-sm text-white">Topological Skill DAG</h3>
              <p className="text-xs text-slate-400">
                Interactive prerequisite graphs resolving dependency loops before study starts.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md shadow-sm">
            <CardContent className="p-5 space-y-1.5">
              <span className="text-xl">📄</span>
              <h3 className="font-bold text-sm text-white">AI ATS Resume Gap Audit</h3>
              <p className="text-xs text-slate-400">
                Identifies missing technical competencies and auto-generates bridge roadmaps.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-md shadow-sm">
            <CardContent className="p-5 space-y-1.5">
              <span className="text-xl">⚡</span>
              <h3 className="font-bold text-sm text-white">Proof-of-Skill Sandbox</h3>
              <p className="text-xs text-slate-400">
                Test out of familiar topics with interactive AI evaluations and instant milestone mastery.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Career Tracks */}
        {meta?.tracks && (
          <div className="pt-2 text-xs text-slate-400 space-y-2">
            <p className="font-medium text-slate-300">Supported Target Career Tracks:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {meta.tracks.map((t, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-300 font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
