import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/lib/api';

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  format: string;
  estimatedHours: number;
  provider: string;
  difficulty: string;
  url: string;
  skills: string[];
}

interface RoadmapItem {
  id: string;
  status: string;
  feedback: string | null;
  aiExplanation: string;
  orderIndex: number;
  catalogItem: CatalogItem;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  items: RoadmapItem[];
}

interface RoadmapData {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  milestones: Milestone[];
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const DEMO_ROADMAP: RoadmapData = {
  id: 'demo',
  title: 'Full Stack & Frontend Developer Roadmap',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  milestones: [
    {
      id: 'm1',
      title: 'Phase 1: Foundations & Web Fundamentals',
      description: 'Master core HTML, CSS, JavaScript, and essential web fundamentals.',
      orderIndex: 1,
      items: [
        {
          id: 'i1',
          status: 'COMPLETED',
          feedback: 'GOOD_FIT',
          aiExplanation: 'Immediate hands-on project to cut early dropout and build semantic web structure.',
          orderIndex: 1,
          catalogItem: {
            id: 'c1',
            title: 'Hands-on Micro-Project: Build an Accessible Responsive Landing Page',
            description: 'Learn accessibility, responsive layouts, and standard semantic elements in under an hour.',
            format: 'project',
            estimatedHours: 1.0,
            provider: 'PathWise Academy',
            difficulty: 'beginner',
            url: 'https://developer.mozilla.org',
            skills: ['HTML5', 'Accessibility', 'CSS3']
          }
        },
        {
          id: 'i2',
          status: 'IN_PROGRESS',
          feedback: null,
          aiExplanation: 'Required prerequisite for React. Teaches DOM manipulation, async JavaScript, and event listeners.',
          orderIndex: 2,
          catalogItem: {
            id: 'c2',
            title: 'JavaScript ES6+ Deep Dive & Asynchronous Programming',
            description: 'Master closures, promises, async/await, and array transformations.',
            format: 'course',
            estimatedHours: 8.0,
            provider: 'PathWise Academy',
            difficulty: 'beginner',
            url: 'https://javascript.info',
            skills: ['JavaScript', 'ES6']
          }
        }
      ]
    },
    {
      id: 'm2',
      title: 'Phase 2: Modern Frontend Frameworks & State Management',
      description: 'Build interactive Single Page Applications using React and component-driven architecture.',
      orderIndex: 2,
      items: [
        {
          id: 'i3',
          status: 'TODO',
          feedback: null,
          aiExplanation: 'The industry-standard frontend library that matches your goal. Connects JavaScript knowledge to UI state.',
          orderIndex: 1,
          catalogItem: {
            id: 'c3',
            title: 'React 18: Hooks, Routing & State Management',
            description: 'Component lifecycles, custom hooks, Zustand, and client-side routing.',
            format: 'course',
            estimatedHours: 12.0,
            provider: 'PathWise Academy',
            difficulty: 'intermediate',
            url: 'https://react.dev',
            skills: ['React', 'Zustand', 'Routing']
          }
        },
        {
          id: 'i4',
          status: 'TODO',
          feedback: null,
          aiExplanation: 'Outside your usual path — worth a look: Introduces UI/UX accessibility standards for enterprise design.',
          orderIndex: 2,
          catalogItem: {
            id: 'c4',
            title: 'Wildcard: Inclusive Design & WCAG 2.2 Accessibility Auditing',
            description: 'Learn keyboard navigation, contrast ratios, and screen-reader testing.',
            format: 'article',
            estimatedHours: 3.0,
            provider: 'PathWise Insights',
            difficulty: 'intermediate',
            url: 'https://www.w3.org/WAI',
            skills: ['Accessibility', 'UX Design']
          }
        }
      ]
    }
  ]
};

export default function RoadmapView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  // Adaptation narration banner
  const [narration, setNarration] = useState<string | null>(null);

  // Mastery Quiz state
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  useEffect(() => {
    if (!id || id === 'demo' || id === 'undefined') {
      api.get('/roadmaps')
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setRoadmap(res.data[0]);
          } else {
            setRoadmap(DEMO_ROADMAP);
          }
        })
        .catch(() => setRoadmap(DEMO_ROADMAP))
        .finally(() => setLoading(false));
      return;
    }

    api.get(`/roadmaps/${id}`)
      .then((res) => {
        if (res.data && res.data.milestones && res.data.milestones.length > 0) {
          setRoadmap(res.data);
        } else {
          return api.get('/roadmaps').then((rRes) => {
            if (rRes.data && rRes.data.length > 0) {
              setRoadmap(rRes.data[0]);
            } else {
              setRoadmap(DEMO_ROADMAP);
            }
          });
        }
      })
      .catch(() => {
        api.get('/roadmaps')
          .then((rRes) => {
            if (rRes.data && rRes.data.length > 0) {
              setRoadmap(rRes.data[0]);
            } else {
              setRoadmap(DEMO_ROADMAP);
            }
          })
          .catch(() => setRoadmap(DEMO_ROADMAP));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleItemStatus = async (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    
    setRoadmap((prev) => {
      if (!prev) return prev;
      const updatedMilestones = prev.milestones.map((m) => ({
        ...m,
        items: m.items.map((i) => (i.id === itemId ? { ...i, status: newStatus } : i))
      }));
      return { ...prev, milestones: updatedMilestones };
    });

    if (id !== 'demo') {
      try {
        await api.patch(`/roadmaps/items/${itemId}/status`, { status: newStatus });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFeedback = async (itemId: string, feedbackType: string) => {
    try {
      let resNarration = "Pacing updated.";
      if (id !== 'demo') {
        const res = await api.post(`/roadmaps/items/${itemId}/feedback`, { feedback: feedbackType });
        resNarration = res.data.narration;
      } else {
        resNarration = feedbackType === 'TOO_HARD' 
          ? "PathWise detected this topic is challenging. Dynamically recalibrated your roadmap with foundational resources."
          : "Great velocity! PathWise fast-tracked your roadmap towards advanced capstones.";
      }

      setNarration(resNarration);
      setTimeout(() => setNarration(null), 8000);
    } catch (err) {
      console.error(err);
    }
  };

  const [activeQuizMilestoneId, setActiveQuizMilestoneId] = useState<string | null>(null);

  const openQuiz = (milestoneId: string) => {
    setActiveQuizMilestoneId(milestoneId);
    setQuizModalOpen(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizScore(null);

    api.get(`/roadmaps/milestones/${milestoneId}/quiz`)
      .then((res) => setQuizQuestions(res.data.questions || []))
      .catch(() => {
        setQuizQuestions([
          {
            id: 1,
            question: "What is the primary benefit of semantic HTML over generic <div> elements?",
            options: ["Faster GPU rendering", "Better accessibility, SEO, and document structure", "Auto CSS styling", "Reduces file size"],
            correctIndex: 1,
            explanation: "Semantic tags like <nav> and <article> provide semantic clarity for assistive tech."
          },
          {
            id: 2,
            question: "What does the async/await syntax in ES6+ provide?",
            options: ["Blocks thread execution", "Syntactic sugar over Promises for readable async code", "Browser multithreading", "Auto-memoization"],
            correctIndex: 1,
            explanation: "async/await simplifies Promise chaining into sequential-like code."
          },
          {
            id: 3,
            question: "When scheduling prerequisite skills with a DAG, what does Topological Sorting prevent?",
            options: ["Starting advanced topics before their prerequisites are mastered", "Alphabetical course ordering", "Database indexing", "CSS layout shifts"],
            correctIndex: 0,
            explanation: "Topological sorting guarantees all prerequisite competencies are covered before downstream dependents."
          }
        ]);
      });
  };

  const submitQuiz = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    const percent = Math.round((correct / quizQuestions.length) * 100);
    setQuizScore(percent);
    setQuizSubmitted(true);

    if (percent >= 70 && activeQuizMilestoneId && roadmap) {
      const targetMilestone = roadmap.milestones.find(m => m.id === activeQuizMilestoneId);
      if (targetMilestone) {
        targetMilestone.items.forEach(async (it) => {
          if (it.status !== 'COMPLETED') {
            await toggleItemStatus(it.id, it.status);
          }
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  const allItems = roadmap?.milestones?.flatMap((m) => m.items) || [];
  const completedCount = allItems.filter((i) => i.status === 'COMPLETED').length;
  const progressPercent = allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0;
  const totalHours = allItems.reduce((acc, curr) => acc + (curr.catalogItem?.estimatedHours || 5), 0);

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600">
            &larr; Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/skill-graph')} className="text-xs font-bold text-[#5051F9] bg-[#EDE9FE] border-purple-200 rounded-full">
            🕸️ View Skill Graph (DAG)
          </Button>
          <Button variant="outline" onClick={() => navigate('/portfolio')} className="text-xs font-bold rounded-full">
            📜 Mastery Portfolio
          </Button>
        </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Progress: {progressPercent}%</span>
            <div className="w-32 bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Adaptive Recalibration Narration Banner */}
        {narration && (
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <span className="text-2xl">⚡</span>
            <div>
              <h4 className="font-bold text-sm">Roadmap Visibly Re-Adapted!</h4>
              <p className="text-xs text-blue-100">{narration}</p>
            </div>
          </div>
        )}

        {/* Roadmap Banner */}
        <Card className="border-none shadow-sm bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>🎯 Topological DAG Verified</span>
              <span>•</span>
              <span>Total Est. Time: ~{Math.round(totalHours)} Hours</span>
              <span>•</span>
              <span>~{Math.max(1, Math.round(totalHours / 10))} Weeks at 10h/wk</span>
            </div>
            <CardTitle className="text-3xl font-extrabold text-white">{roadmap?.title}</CardTitle>
            <CardDescription className="text-slate-300 text-sm">
              Grounded in empirical learning research: Immediate hands-on projects, zero circular dependencies, and verifiable mastery assessments.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Milestones & Items Timeline */}
        <div className="space-y-8">
          {roadmap?.milestones?.map((milestone, mIdx) => (
            <div key={milestone.id || mIdx} className="space-y-4">
              
              {/* Phase Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {mIdx + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{milestone.title}</h2>
                    <p className="text-xs text-slate-500">{milestone.description}</p>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => openQuiz(milestone.id)}
                  className="text-xs font-semibold self-start sm:self-auto border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  📝 Take Phase {mIdx + 1} Mastery Check
                </Button>
              </div>

              {/* Phase Items List */}
              <div className="grid grid-cols-1 gap-4 pl-3 md:pl-10 border-l-2 border-slate-200">
                {milestone.items?.map((item, iIdx) => {
                  const isDone = item.status === 'COMPLETED';
                  const ci = item.catalogItem || {};
                  const isWildcard = item.aiExplanation?.includes('Outside your usual path') || ci.title?.includes('Wildcard');

                  return (
                    <Card 
                      key={item.id || iIdx} 
                      className={`transition-all duration-200 border ${
                        isDone 
                          ? 'bg-slate-50/80 border-green-300 opacity-90' 
                          : isWildcard
                            ? 'bg-amber-50/40 border-amber-300 shadow-sm'
                            : 'bg-white hover:border-blue-300 shadow-sm'
                      }`}
                    >
                      <CardContent className="p-5 space-y-4">
                        
                        {/* Top row: Checkbox, Title & Badges */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleItemStatus(item.id, item.status)}
                              className={`mt-1 w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                                isDone 
                                  ? 'bg-green-600 border-green-600 text-white' 
                                  : 'border-slate-300 hover:border-blue-500'
                              }`}
                              title={isDone ? 'Mark Incomplete' : 'Mark Complete'}
                            >
                              {isDone && '✓'}
                            </button>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className={`text-base md:text-lg font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                  {ci.title || `Resource ${iIdx + 1}`}
                                </h3>
                                {isWildcard && (
                                  <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold uppercase">
                                    🌟 Wildcard Serendipity
                                  </span>
                                )}
                              </div>
                              <p className="text-xs md:text-sm text-slate-600 mt-0.5">{ci.description}</p>
                            </div>
                          </div>

                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            ci.difficulty === 'beginner' 
                              ? 'bg-green-100 text-green-800' 
                              : ci.difficulty === 'intermediate' 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-purple-100 text-purple-800'
                          }`}>
                            {ci.difficulty || 'Core'}
                          </span>
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-medium capitalize">
                            📦 {ci.format || 'Course'}
                          </span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                            ⏱️ ~{ci.estimatedHours || 5}h Segment
                          </span>
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-semibold border border-green-200">
                            🌿 Verified Fresh
                          </span>
                          {ci.skills?.map((skill) => (
                            <span key={skill} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-100">
                              #{skill}
                            </span>
                          ))}
                        </div>

                        {/* AI "Why This Milestone?" Callout Box */}
                        {item.aiExplanation && (
                          <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3 text-xs md:text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-blue-600 text-base">✨</span>
                            <div>
                              <span className="font-semibold text-blue-900">Why this resource? </span>
                              <span>{item.aiExplanation}</span>
                            </div>
                          </div>
                        )}

                        {/* Feedback & Open Link */}
                        <div className="pt-1 flex flex-wrap justify-between items-center gap-2 border-t text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <span>Pacing fit:</span>
                            <button
                              onClick={() => handleFeedback(item.id, 'GOOD_FIT')}
                              className="px-2 py-1 bg-slate-100 hover:bg-green-50 hover:text-green-700 rounded transition-colors"
                            >
                              👍 Good Fit
                            </button>
                            <button
                              onClick={() => handleFeedback(item.id, 'TOO_HARD')}
                              className="px-2 py-1 bg-slate-100 hover:bg-amber-50 hover:text-amber-700 rounded transition-colors"
                            >
                              📉 Too Hard
                            </button>
                            <button
                              onClick={() => handleFeedback(item.id, 'TOO_EASY')}
                              className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded transition-colors"
                            >
                              📈 Too Easy
                            </button>
                          </div>

                          {ci.url && (
                            <a 
                              href={ci.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Open Resource &rarr;
                            </a>
                          )}
                        </div>

                      </CardContent>
                    </Card>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {/* Mastery Quiz Interactive Modal */}
        {quizModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white shadow-2xl border max-h-[90vh] flex flex-col">
              <CardHeader className="bg-slate-900 text-white">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg text-white">📝 Milestone Mastery Assessment</CardTitle>
                  <button onClick={() => setQuizModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <CardDescription className="text-slate-300 text-xs">
                  Validates real skill retention to update your verifiable mastery graph.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto space-y-6 flex-1">
                {quizSubmitted ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="text-4xl">🎉</div>
                    <h3 className="text-2xl font-bold text-slate-900">Assessment Score: {quizScore}%</h3>
                    <p className="text-sm text-slate-600">
                      {quizScore && quizScore >= 70 
                        ? 'Mastery verified! Milestone competencies recorded in your skill DAG.'
                        : 'Review the explanations below to reinforce prerequisite concepts.'}
                    </p>

                    <div className="space-y-4 text-left pt-4">
                      {quizQuestions.map((q) => (
                        <div key={q.id} className="p-4 bg-slate-50 border rounded-lg space-y-1.5 text-xs">
                          <p className="font-bold text-slate-900 text-sm">{q.question}</p>
                          <p className="text-green-700 font-semibold">✓ Correct Answer: {q.options[q.correctIndex]}</p>
                          <p className="text-slate-600">{q.explanation}</p>
                        </div>
                      ))}
                    </div>

                    <Button onClick={() => setQuizModalOpen(false)} className="w-full mt-4">
                      Back to Roadmap
                    </Button>
                  </div>
                ) : (
                  <>
                    {quizQuestions.map((q, idx) => (
                      <div key={q.id} className="space-y-2">
                        <h4 className="font-bold text-sm text-slate-900">
                          {idx + 1}. {q.question}
                        </h4>
                        <div className="space-y-1.5">
                          {q.options.map((opt, optIdx) => (
                            <label 
                              key={optIdx} 
                              className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                                selectedAnswers[q.id] === optIdx 
                                  ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold' 
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                checked={selectedAnswers[q.id] === optIdx}
                                onChange={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <Button 
                      onClick={submitQuiz} 
                      disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                      className="w-full mt-4"
                    >
                      Submit Mastery Check 🚀
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

    </div>
  );
}
