import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

const GENERATION_STEPS = [
  { label: 'Analyzing your career goal with Google Gemini AI...', percent: 25 },
  { label: 'Computing vector embeddings & semantic matching...', percent: 50 },
  { label: 'Resolving prerequisite dependencies via Topological Sort...', percent: 75 },
  { label: 'Generating personalized milestone roadmap & explanations...', percent: 95 }
];

const PRESETS = [
  { title: "Frontend Developer", desc: "I want to become a Frontend Developer from scratch (HTML, CSS, JavaScript, React)." },
  { title: "Data Analyst", desc: "I know basic Python and want to become a Data Analyst using Pandas, SQL & visualization." },
  { title: "Machine Learning Engineer", desc: "I want to become a Machine Learning Engineer starting with Scikit-Learn & Math." },
  { title: "Full Stack Developer", desc: "I want to build complete full-stack web applications with React and Spring Boot / Postgres." }
];

export default function Onboarding() {
  const [goal, setGoal] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [learningStyle, setLearningStyle] = useState('hands-on');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    setError('');
    setLoading(true);
    setStepIndex(0);

    try {
      const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/profile', { 
        goal: goal.trim(),
        currentSkills: skillsArray,
        weeklyHours,
        learningStyle
      });

      const res = await api.post('/roadmaps/generate');
      
      if (res.data?.id) {
        navigate(`/roadmap/${res.data.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Roadmap generation failed:', err);
      setError(err.response?.data?.message || 'Failed to generate roadmap. Please check backend connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">
      <Card className="w-full border border-slate-100 shadow-sm bg-white rounded-3xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Personalize Your Learning Journey</CardTitle>
              <CardDescription className="text-xs">
                Provide your custom goals and constraints. PathWise uses AI & DAG algorithms to build your path.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="text-slate-500 text-xs">
              Skip to Dashboard
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium">
              {error}
            </div>
          )}
          
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
                  Sequencing prerequisite dependencies without hallucinated prerequisites...
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
                <span className={stepIndex >= 3 ? "font-semibold text-blue-600" : ""}>4. Milestone DAG</span>
              </div>
            </div>
          ) : (
            <>
              {/* Target Goal Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">What is your primary career or learning goal?</label>
                <Textarea 
                  placeholder="e.g., I want to become a Frontend Developer. I know basic HTML/CSS and want to master React, TypeScript, and modern state management."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="min-h-[100px] text-sm"
                />
              </div>

              {/* Preset suggestion chips */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Suggestions</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setGoal(preset.desc)}
                      className="text-xs bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 p-2.5 rounded-lg border text-left transition-colors"
                    >
                      <span className="font-bold text-blue-900 block">{preset.title}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{preset.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Current Skills (comma separated)</label>
                  <Input
                    placeholder="e.g., HTML, CSS, Basic Python"
                    value={currentSkills}
                    onChange={(e) => setCurrentSkills(e.target.value)}
                    className="text-xs"
                  />
                  <p className="text-[11px] text-slate-400">PathWise skips topics you already know.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Weekly Time Availability</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={2}
                      max={60}
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 10)}
                      className="text-xs"
                    />
                    <span className="text-xs text-slate-600 whitespace-nowrap">Hours / Week</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Used to calculate milestone deadlines.</p>
                </div>
              </div>

              {/* Learning Style Preference */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Preferred Learning Format</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'hands-on', label: '🛠️ Hands-on Projects' },
                    { id: 'course', label: '🎥 Video Courses' },
                    { id: 'article', label: '📖 Interactive Docs' }
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setLearningStyle(style.id)}
                      className={`text-xs p-2 rounded-lg border font-medium transition-colors ${
                        learningStyle === style.id 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={!goal.trim() || loading} 
                size="lg"
                className="w-full text-sm font-bold py-6 bg-blue-600 hover:bg-blue-700"
              >
                Generate Personalized Path &rarr;
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
