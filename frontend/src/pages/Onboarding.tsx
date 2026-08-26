import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sparkles, Star, Search, Flame, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

const GENERATION_STEPS = [
  { label: 'Matching against curated & verified career roadmaps...', percent: 25 },
  { label: 'Resolving prerequisite dependencies via Topological Sort...', percent: 50 },
  { label: 'Constructing 3-Phase milestone architecture with project-first start...', percent: 75 },
  { label: 'Finalizing personalized study timeline & interactive quizzes...', percent: 95 }
];

interface RoadmapTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  skills: string[];
  level: string;
  rating?: number;
  upvotes?: number;
}

export default function Onboarding() {
  const [goal, setGoal] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [weeklyHours, setWeeklyHours] = useState(10);
  const [learningStyle, setLearningStyle] = useState('hands-on');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [templates, setTemplates] = useState<RoadmapTemplate[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch available curated templates from backend
    api.get('/roadmaps/templates')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setTemplates(res.data);
        }
      })
      .catch(() => {
        // Fallback default templates
        setTemplates([
          { id: 'frontend', slug: 'frontend', name: 'Frontend Developer', category: 'Role-based Roadmap', tagline: 'Master modern HTML, CSS, JavaScript, TypeScript, React, Next.js', skills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js'], level: 'Beginner to Advanced', rating: 4.98, upvotes: 42300 },
          { id: 'backend', slug: 'backend', name: 'Backend Developer', category: 'Role-based Roadmap', tagline: 'Master Node.js, Python, Go, PostgreSQL, REST APIs, Microservices, Docker', skills: ['Node.js', 'Python', 'Go', 'PostgreSQL', 'Redis', 'Docker'], level: 'Beginner to Advanced', rating: 4.97, upvotes: 39800 },
          { id: 'full-stack', slug: 'full-stack', name: 'Full Stack Developer', category: 'Role-based Roadmap', tagline: 'Master React, Node.js, TypeScript, PostgreSQL, REST/GraphQL, Cloud', skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'], level: 'Intermediate to Advanced', rating: 4.96, upvotes: 35600 },
          { id: 'ai-engineer', slug: 'ai-engineer', name: 'AI Engineer', category: 'Role-based Roadmap', tagline: 'Master LLMs, LangChain, LlamaIndex, Vector DBs, RAG, Prompt Engineering', skills: ['Python', 'OpenAI APIs', 'LangChain', 'LlamaIndex', 'RAG'], level: 'Intermediate to Advanced', rating: 4.99, upvotes: 48900 },
          { id: 'devops', slug: 'devops', name: 'DevOps & Cloud Engineer', category: 'Role-based Roadmap', tagline: 'Master Linux, Docker, Kubernetes, Terraform, GitHub Actions, AWS/GCP', skills: ['Linux', 'Docker', 'Kubernetes', 'Terraform', 'AWS'], level: 'Intermediate to Advanced', rating: 4.94, upvotes: 33400 },
          { id: 'data-analyst', slug: 'data-analyst', name: 'Data Analyst', category: 'Role-based Roadmap', tagline: 'Master SQL, Python (Pandas/Seaborn), Power BI/Tableau, Statistics', skills: ['SQL', 'Excel', 'Python', 'Power BI', 'Statistics'], level: 'Beginner to Intermediate', rating: 4.90, upvotes: 26700 }
        ]);
      });
  }, []);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
      }, 1000);
    } else {
      setStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (customGoal?: string) => {
    const targetGoal = customGoal || goal;
    if (!targetGoal.trim()) return;
    setError('');
    setLoading(true);
    setStepIndex(0);

    try {
      const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
      await api.post('/profile', { 
        goal: targetGoal.trim(),
        currentSkills: skillsArray,
        weeklyHours,
        learningStyle
      });

      const res = await api.post('/roadmaps/generate');
      if (res.data && res.data.id) {
        navigate(`/roadmap/${res.data.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Roadmap generation failed:', err);
      if (err.response?.status === 401) {
        setError('Your login session has expired. Please log out from the bottom sidebar and sign in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to generate roadmap. Please check that you are signed in and retry.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.tagline?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.skills?.some(s => s.toLowerCase().includes(searchFilter.toLowerCase()));

    if (selectedCategory === 'All') return matchesSearch;
    if (selectedCategory === 'Roles') return matchesSearch && t.category?.includes('Role');
    if (selectedCategory === 'Skills') return matchesSearch && t.category?.includes('Skill');
    if (selectedCategory === 'AI & ML') return matchesSearch && (t.name.toLowerCase().includes('ai') || t.name.toLowerCase().includes('learning') || t.name.toLowerCase().includes('data'));
    return matchesSearch;
  });

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto pb-10">
      
      <Card className="w-full border border-slate-100 shadow-sm bg-white rounded-3xl overflow-hidden">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#4F46E5] via-[#5051F9] to-[#6366F1] p-6 md:p-8 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white mb-2">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                Curated Roadmaps & AI Sequencing
              </span>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Personalize Your Learning Journey
              </h1>
              <p className="text-xs text-blue-100 mt-1 max-w-xl">
                Choose from 60+ verified industry roadmaps or input any custom goal. PathWise sequences your prerequisites and builds a 3-Phase structured roadmap.
              </p>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard')} 
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs rounded-full cursor-pointer backdrop-blur-sm"
            >
              Skip to Dashboard &rarr;
            </Button>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-6">

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="py-12 space-y-6 text-center animate-in fade-in duration-300">
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-purple-100 border-t-[#5051F9] animate-spin"></div>
                <span className="absolute text-2xl">🗺️</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {GENERATION_STEPS[stepIndex].label}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Sequencing prerequisite dependencies without circular blockers...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/60 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${GENERATION_STEPS[stepIndex].percent}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-slate-400 pt-2 max-w-lg mx-auto">
                <span className={stepIndex >= 0 ? "text-[#5051F9]" : ""}>1. Template Match</span>
                <span className={stepIndex >= 1 ? "text-[#5051F9]" : ""}>2. Topological Sort</span>
                <span className={stepIndex >= 2 ? "text-[#5051F9]" : ""}>3. 3-Phase Layout</span>
                <span className={stepIndex >= 3 ? "text-[#5051F9]" : ""}>4. Project-First Start</span>
              </div>
            </div>
          ) : (
            <>
              {/* Target Goal Input */}
              <div className="space-y-2">
                <label className="text-sm font-extrabold text-slate-900">
                  What is your primary career or learning goal?
                </label>
                <Textarea 
                  placeholder="e.g., Frontend Developer (or select a curated path below)"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="min-h-[85px] text-xs md:text-sm rounded-2xl border-slate-200 focus:border-[#5051F9] focus:ring-[#5051F9]/20"
                />
              </div>

              {/* Curated Catalog Roadmaps Section */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>Curated Verified Roadmaps</span>
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Select any curated template for instant, battle-tested prerequisite sequencing.
                    </p>
                  </div>

                  {/* Search and Category Filter */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <Input
                        placeholder="Search 60+ paths..."
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="pl-8 text-xs h-8 rounded-full border-slate-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Roles', 'Skills', 'AI & ML'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`
                        px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer
                        ${selectedCategory === cat 
                          ? 'bg-[#5051F9] text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-[#5051F9]'}
                      `}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Template Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
                  {filteredTemplates.slice(0, 15).map((tmpl) => {
                    const isSelected = goal.toLowerCase() === tmpl.name.toLowerCase() || goal.toLowerCase() === tmpl.id.toLowerCase();
                    return (
                      <div
                        key={tmpl.id}
                        onClick={() => setGoal(tmpl.name)}
                        className={`
                          p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left
                          ${isSelected 
                            ? 'bg-purple-50/70 border-[#5051F9] ring-2 ring-[#5051F9]/30 shadow-xs' 
                            : 'bg-white border-slate-200/80 hover:border-purple-300 hover:bg-slate-50/50 shadow-2xs'}
                        `}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                              {tmpl.category?.replace(' Roadmap', '') || 'Curated'}
                            </span>
                            {tmpl.rating && (
                              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span>{tmpl.rating}</span>
                              </div>
                            )}
                          </div>
                          
                          <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                            {tmpl.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                            {tmpl.tagline || tmpl.name}
                          </p>
                        </div>

                        <div className="pt-2.5 mt-2 border-t border-slate-100 flex flex-wrap gap-1">
                          {tmpl.skills?.slice(0, 3).map((s, sIdx) => (
                            <span key={sIdx} className="text-[9px] font-semibold bg-[#EDE9FE] text-[#7C3AED] px-1.5 py-0.5 rounded">
                              {s}
                            </span>
                          ))}
                          {tmpl.skills && tmpl.skills.length > 3 && (
                            <span className="text-[9px] font-medium text-slate-400">
                              +{tmpl.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Skills & Weekly Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800">
                    Current Skills (comma separated)
                  </label>
                  <Input
                    placeholder="e.g., HTML, CSS, Basic Python"
                    value={currentSkills}
                    onChange={(e) => setCurrentSkills(e.target.value)}
                    className="text-xs rounded-xl border-slate-200"
                  />
                  <p className="text-[10px] text-slate-400">
                    PathWise skips topics you already know to save study time.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800">
                    Weekly Time Availability
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={2}
                      max={60}
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(parseInt(e.target.value) || 10)}
                      className="text-xs rounded-xl border-slate-200"
                    />
                    <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Hours / Week</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Calculates realistic milestones and pacing deadlines.
                  </p>
                </div>
              </div>

              {/* Learning Style Preference */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-800">
                  Preferred Learning Format
                </label>
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
                      className={`
                        p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5
                        ${learningStyle === style.id
                          ? 'border-[#5051F9] bg-[#EDE9FE] text-[#5051F9] shadow-2xs'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300'}
                      `}
                    >
                      {learningStyle === style.id && <CheckCircle2 className="w-3 h-3 text-[#5051F9]" />}
                      <span>{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={() => handleGenerate()} 
                disabled={!goal.trim() || loading} 
                className="w-full py-4 bg-[#5051F9] hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-md transition-transform hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Generate Personalized Learning Path</span>
                <span>&rarr;</span>
              </button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
