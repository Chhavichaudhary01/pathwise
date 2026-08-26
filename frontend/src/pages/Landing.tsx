import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        
        {/* Top User Bar */}
        <div className="flex justify-between items-center bg-white border px-5 py-2.5 rounded-full shadow-sm max-w-lg mx-auto text-xs">
          {isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-semibold text-slate-700">Signed in as {user.email}</span>
              </div>
              <button onClick={logout} className="text-slate-500 hover:text-red-600 font-bold">
                Log Out
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="font-semibold text-slate-700">PathWise AI Platform</span>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-blue-600 hover:underline font-bold">
                  Sign In
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-3 py-1 rounded-full font-bold hover:bg-blue-700">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Engine & DB Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold">
          <span>⚡ Engine: {meta?.aiEngine || 'Google Gemini 1.5 Flash'}</span>
          <span>•</span>
          <span>DB: {meta?.database || 'Neon PostgreSQL'}</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
          Your AI-Powered Career <span className="text-blue-600">PathWise</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          {meta?.tagline || "Tell us where you want to go. We'll generate a personalized, prerequisite-resolved roadmap to get you there—step by step."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center items-center pt-2">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">
                <Button size="lg" className="text-base px-8 bg-blue-600 hover:bg-blue-700 font-bold shadow-md">
                  Go to Dashboard &rarr;
                </Button>
              </Link>
              <Link to="/my-task">
                <Button size="lg" variant="outline" className="text-base px-6 font-semibold">
                  📋 My Tasks
                </Button>
              </Link>
              <Link to="/onboarding">
                <Button size="lg" variant="outline" className="text-base px-6 font-semibold">
                  + Generate Roadmap
                </Button>
              </Link>
              <Link to="/skill-graph">
                <Button size="lg" variant="outline" className="text-base px-6 font-semibold">
                  🕸️ Skill DAG
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button 
                onClick={handleInstantDemo} 
                disabled={demoLoading}
                size="lg" 
                className="text-base px-8 bg-blue-600 hover:bg-blue-700 font-bold shadow-md"
              >
                {demoLoading ? 'Launching Demo...' : '⚡ Try Instant Demo (1-Click) 🚀'}
              </Button>
              <Link to="/register">
                <Button size="lg" variant="outline" className="text-base px-6 font-semibold">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="ghost" className="text-base px-4 font-semibold text-slate-600">
                  Sign In &rarr;
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Stats & Career Tracks Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
          <Card className="border shadow-sm bg-white">
            <CardContent className="pt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deterministic DAG Engine</h3>
              <p className="text-2xl font-black text-slate-900 mt-1">{meta?.totalSkillsCovered || 14}+ Core Skills</p>
              <p className="text-xs text-slate-500 mt-2">Zero prerequisite hallucinations via Topological Sorting.</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white">
            <CardContent className="pt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Curated Catalog</h3>
              <p className="text-2xl font-black text-slate-900 mt-1">{meta?.totalCatalogItems || 60}+ Courses & Projects</p>
              <p className="text-xs text-slate-500 mt-2">Semantic vector matching powered by text-embedding-004.</p>
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-white">
            <CardContent className="pt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Career Tracks</h3>
              <div className="flex flex-wrap gap-1 mt-2">
                {(meta?.tracks || ['Frontend', 'Data Analyst', 'ML Engineer', 'Product Manager']).map(track => (
                  <span key={track} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {track}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
