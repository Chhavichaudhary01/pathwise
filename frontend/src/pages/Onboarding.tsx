import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

const GENERATION_STEPS = [
  { label: 'Analyzing your career goal with Google Gemini AI...', percent: 25 },
  { label: 'Computing vector embeddings & semantic matching...', percent: 50 },
  { label: 'Resolving prerequisite dependencies via Topological Sort...', percent: 75 },
  { label: 'Generating personalized milestone roadmap & explanations...', percent: 95 }
];

const PRESETS = [
  "I want to become a Frontend Developer from scratch (HTML, CSS, React).",
  "I know basic Python and want to become a Data Analyst using Pandas & SQL.",
  "I want to become a Machine Learning Engineer starting with Scikit-Learn.",
  "I want to transition into Product Management with Agile methodologies."
];

export default function Onboarding() {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
      }, 1200);
    } else {
      setStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setStepIndex(0);

    try {
      await api.post('/profile', { goal });
      const res = await api.post('/roadmaps/generate');
      
      // Allow user to see final step before navigating
      setTimeout(() => {
        navigate(`/roadmap/${res.data.id}`);
      }, 600);
    } catch (err: any) {
      console.error('Roadmap generation failed:', err);
      // Fallback for instant demo
      navigate('/roadmap/demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-2xl border shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">Plan Your Learning Journey</CardTitle>
          <CardDescription>
            Tell PathWise what you want to achieve, your current skill level, or your dream role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {loading ? (
            <div className="py-8 space-y-6 text-center animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                <span className="absolute text-2xl">🗺️</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {GENERATION_STEPS[stepIndex].label}
                </h3>
                <p className="text-sm text-slate-500">
                  Building a mathematically optimal Directed Acyclic Graph (DAG) for your path...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${GENERATION_STEPS[stepIndex].percent}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-500 pt-2">
                <span className={stepIndex >= 0 ? "font-semibold text-blue-600" : ""}>1. Goal Parsing</span>
                <span className={stepIndex >= 1 ? "font-semibold text-blue-600" : ""}>2. Embeddings</span>
                <span className={stepIndex >= 2 ? "font-semibold text-blue-600" : ""}>3. Graph Sort</span>
                <span className={stepIndex >= 3 ? "font-semibold text-blue-600" : ""}>4. Final Roadmap</span>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">What is your learning or career goal?</label>
                <Textarea 
                  placeholder="e.g., I want to become a Frontend Developer. I know basic HTML/CSS and want to master React and modern tooling."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="min-h-[140px] text-base"
                />
              </div>

              {/* Preset suggestion chips */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setGoal(preset)}
                      className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-full border transition-colors text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={!goal.trim() || loading} 
                size="lg"
                className="w-full text-base font-semibold py-6"
              >
                Generate Personalized Roadmap 🚀
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
