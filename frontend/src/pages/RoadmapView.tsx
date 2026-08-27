import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock, ExternalLink, MessageSquare, Sparkles, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import RoadmapInteractiveGraph from '@/components/RoadmapInteractiveGraph';

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

interface Roadmap {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  milestones: Milestone[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function RoadmapView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [narration, setNarration] = useState<string | null>(null);

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizMilestoneId, setQuizMilestoneId] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Inline Feedback State
  const [feedbackModalItem, setFeedbackModalItem] = useState<string | null>(null);

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      const endpoint = id ? `/roadmaps/${id}` : '/roadmaps/current';
      const res = await api.get(endpoint);
      setRoadmap(res.data);
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemStatus = async (itemId: string, currentStatus: string, explicitNextStatus?: string) => {
    let nextStatus = explicitNextStatus;
    if (!nextStatus) {
      if (currentStatus === 'COMPLETED') {
        nextStatus = 'NOT_STARTED';
      } else if (currentStatus === 'IN_PROGRESS') {
        nextStatus = 'COMPLETED';
      } else {
        nextStatus = 'IN_PROGRESS';
      }
    }

    // Optimistic UI update so buttons respond instantly
    setRoadmap((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        milestones: prev.milestones.map((m) => ({
          ...m,
          items: m.items.map((it) => (it.id === itemId ? { ...it, status: nextStatus } : it))
        }))
      };
    });

    try {
      await api.patch(`/roadmaps/items/${itemId}/status`, { status: nextStatus }, {
        params: { status: nextStatus }
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleFeedback = async (itemId: string, feedback: string) => {
    try {
      const res = await api.post(`/roadmaps/items/${itemId}/feedback`, { feedback });
      if (res.data && res.data.roadmap) {
        setRoadmap(res.data.roadmap);
        setNarration(res.data.narration || 'Your roadmap has been adapted based on your pacing!');
        setTimeout(() => setNarration(null), 8000);
      }
      setFeedbackModalItem(null);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const openQuiz = async (milestoneId: string) => {
    setQuizMilestoneId(milestoneId);
    setQuizModalOpen(true);
    setQuizSubmitted(false);
    setSelectedAnswers({});
    setQuizScore(null);
    setQuizLoading(true);

    try {
      const res = await api.get(`/roadmaps/milestones/${milestoneId}/quiz`);
      setQuizQuestions(res.data.questions || []);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    const percentage = Math.round((correct / quizQuestions.length) * 100);
    setQuizScore(percentage);
    setQuizSubmitted(true);

    if (percentage >= 70 && quizMilestoneId && roadmap) {
      const targetMilestone = roadmap.milestones.find((m) => m.id === quizMilestoneId);
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
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-[#5051F9] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Loading personalized roadmap & visual DAG...</p>
        </div>
      </div>
    );
  }

  const allItems = roadmap?.milestones?.flatMap((m) => m.items) || [];
  const completedCount = allItems.filter((i) => i.status === 'COMPLETED').length;
  const progressPercent = allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0;
  const totalHours = allItems.reduce((acc, curr) => acc + (curr.catalogItem?.estimatedHours || 5), 0);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12">
      
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600 -ml-2 text-xs font-bold">
            &larr; Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/skill-graph')} className="text-xs font-bold text-[#5051F9] bg-[#EDE9FE] border-purple-200 rounded-full">
            🕸️ Full Skill Graph
          </Button>
          <Button variant="outline" onClick={() => navigate('/portfolio')} className="text-xs font-bold rounded-full">
            📜 Portfolio
          </Button>
        </div>
          
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-2xs">
          <span className="text-xs font-bold text-slate-700">Roadmap Progress: {progressPercent}%</span>
          <div className="w-28 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#5051F9] h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Adaptive Recalibration Narration Banner */}
      {narration && (
        <div className="p-4 bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white rounded-2xl shadow-sm flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <span className="text-2xl">⚡</span>
          <div>
            <h4 className="font-bold text-xs">Roadmap Visibly Re-Adapted!</h4>
            <p className="text-[11px] text-blue-100">{narration}</p>
          </div>
        </div>
      )}

      {/* Roadmap Hero Banner */}
      <Card className="border border-slate-100 shadow-sm bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl overflow-hidden">
        <CardHeader className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-blue-300 text-[10px] font-extrabold uppercase tracking-wider mb-1">
            <span className="bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30">🎯 Topological DAG Verified</span>
            <span>•</span>
            <span>Est. ~{Math.round(totalHours)} Hours</span>
            <span>•</span>
            <span>~{Math.max(1, Math.round(totalHours / 10))} Weeks at 10h/wk</span>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{roadmap?.title}</CardTitle>
          <CardDescription className="text-slate-300 text-xs mt-1">
            Curated 3-Phase milestone sequence: Hands-on project start, zero circular dependencies, and live Mermaid DAG dependency visualization.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main 2-Column Section: Phases Timeline on Left, Visual Mermaid Graph on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Phases & Items Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-8 min-w-0">
          {roadmap?.milestones?.map((milestone, mIdx) => (
            <div key={milestone.id || mIdx} className="space-y-4">
              
              {/* Phase Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#5051F9] text-white font-extrabold flex items-center justify-center text-xs shadow-2xs">
                    {mIdx + 1}
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 leading-tight">{milestone.title}</h2>
                    <p className="text-[11px] text-slate-400 font-medium">{milestone.description}</p>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => openQuiz(milestone.id)}
                  className="text-[11px] font-bold self-start sm:self-auto border-purple-200 text-[#5051F9] hover:bg-purple-50 rounded-full cursor-pointer"
                >
                  📝 Phase {mIdx + 1} Quiz
                </Button>
              </div>

              {/* Items in Milestone */}
              <div className="space-y-3">
                {milestone.items?.map((item, iIdx) => {
                  const isCompleted = item.status === 'COMPLETED';
                  const isInProgress = item.status === 'IN_PROGRESS';
                  const ci = item.catalogItem || ({} as CatalogItem);

                  return (
                    <Card 
                      key={item.id || iIdx} 
                      className={`transition-all border rounded-2xl ${
                        isCompleted 
                          ? 'bg-emerald-50/30 border-emerald-200/80 shadow-none' 
                          : isInProgress 
                          ? 'bg-purple-50/20 border-purple-200 shadow-2xs' 
                          : 'bg-white border-slate-100 hover:border-slate-200 shadow-2xs'
                      }`}
                    >
                      <CardContent className="p-4 space-y-3">
                        
                        {/* Item Top Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                                ci.format === 'PROJECT' 
                                  ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {ci.format === 'PROJECT' ? '🛠️ Project Start' : ci.format || 'Course'}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ~{ci.estimatedHours || 5} Hours
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                • {ci.difficulty || 'Intermediate'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleItemStatus(item.id, item.status, isCompleted ? 'NOT_STARTED' : 'COMPLETED')}
                                className="cursor-pointer text-slate-400 hover:text-[#5051F9] p-0.5"
                                title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <Circle className="w-5 h-5" />
                                )}
                              </button>
                              <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {ci.title || `Skill Item ${iIdx + 1}`}
                              </h3>
                            </div>
                          </div>

                          {/* Status Action Button */}
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => toggleItemStatus(item.id, item.status, isCompleted ? 'NOT_STARTED' : isInProgress ? 'COMPLETED' : 'IN_PROGRESS')}
                              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${
                                isCompleted 
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                  : isInProgress 
                                  ? 'bg-[#5051F9] text-white hover:bg-indigo-700' 
                                  : 'bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-[#5051F9]'
                              }`}
                            >
                              {isCompleted ? '✓ Completed' : isInProgress ? '⚡ In Progress' : 'Start Skill'}
                            </button>
                          </div>
                        </div>

                        {ci.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {ci.description}
                          </p>
                        )}

                        {/* Skill Tags */}
                        {ci.skills && ci.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {ci.skills.map((s, sIdx) => (
                              <span key={sIdx} className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-md">
                                #{s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* AI Explanation Callout */}
                        {item.aiExplanation && (
                          <div className="p-2.5 bg-[#F8F9FD] border border-purple-100 rounded-xl text-xs text-slate-700 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#5051F9] shrink-0 mt-0.5" />
                            <p className="flex-1 text-[11px] leading-normal font-medium text-slate-700">
                              <span className="font-bold text-[#5051F9]">Sequencing Rationale: </span>
                              {item.aiExplanation}
                            </p>
                          </div>
                        )}

                        {/* Action Link & Feedback */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          {ci.url ? (
                            <a 
                              href={ci.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[#5051F9] font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                            >
                              <span>Resource Material</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">Curated by PathWise</span>
                          )}

                          <button 
                            onClick={() => setFeedbackModalItem(item.id)}
                            className="text-slate-400 hover:text-slate-700 text-[11px] font-medium cursor-pointer inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Flag Pacing</span>
                          </button>
                        </div>

                        {/* Inline Feedback */}
                        {feedbackModalItem === item.id && (
                          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 mt-2 animate-in fade-in">
                            <p className="text-xs font-bold text-slate-800">
                              How is the pacing of this skill? (Recalibrates your path)
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {['TOO_SLOW', 'TOO_FAST', 'TOO_DIFFICULT', 'TOO_EASY', 'IRRELEVANT'].map((reason) => (
                                <button
                                  key={reason}
                                  onClick={() => handleFeedback(item.id, reason)}
                                  className="text-[10px] px-2.5 py-1 bg-white border border-slate-200 hover:border-purple-300 hover:text-[#5051F9] rounded-lg font-bold transition-colors cursor-pointer"
                                >
                                  {reason.replace('_', ' ')}
                                </button>
                              ))}
                              <button
                                onClick={() => setFeedbackModalItem(null)}
                                className="text-[10px] px-2 py-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                      </CardContent>
                    </Card>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

        {/* Right: Interactive React Flow DAG Graph (5 cols, sticky) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <RoadmapInteractiveGraph 
            roadmapTitle={roadmap?.title}
            milestones={roadmap?.milestones}
            onItemStatusChange={toggleItemStatus}
            onAskAi={(topic) => navigate('/chat', { state: { initialMessage: `Can you give me a comprehensive breakdown and key concepts for ${topic}?` } })}
          />
        </div>

      </div>

      {/* Mastery Quiz Interactive Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl bg-white shadow-2xl border border-slate-100 rounded-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base font-extrabold text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Phase Mastery Assessment</span>
                </CardTitle>
                <button 
                  onClick={() => setQuizModalOpen(false)} 
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <CardDescription className="text-blue-100 text-xs mt-1">
                Verifies prerequisite retention to update your skill DAG and verifiable credentials.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto space-y-5 flex-1 text-left">
              {quizLoading ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-8 h-8 border-2 border-[#5051F9] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs font-semibold text-slate-500">Generating mastery questions...</p>
                </div>
              ) : quizSubmitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="text-4xl">🎉</div>
                  <h3 className="text-xl font-extrabold text-slate-900">Score: {quizScore}%</h3>
                  <p className="text-xs text-slate-600">
                    {quizScore && quizScore >= 70 
                      ? 'Mastery verified! Milestone marked completed in your DAG graph.'
                      : 'Review the explanations below to reinforce your understanding.'}
                  </p>

                  <div className="space-y-3 text-left pt-2">
                    {quizQuestions.map((q) => (
                      <div key={q.id} className="p-3.5 bg-[#F8F9FD] border border-slate-200/80 rounded-2xl space-y-1 text-xs">
                        <p className="font-extrabold text-slate-900">{q.question}</p>
                        <p className="text-emerald-700 font-bold">✓ Answer: {q.options[q.correctIndex]}</p>
                        <p className="text-slate-500 text-[11px]">{q.explanation}</p>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setQuizModalOpen(false)} 
                    className="w-full py-2.5 bg-[#5051F9] hover:bg-indigo-700 text-white text-xs font-bold rounded-full cursor-pointer shadow-xs"
                  >
                    Back to Roadmap
                  </button>
                </div>
              ) : (
                <>
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} className="space-y-2">
                      <h4 className="font-bold text-xs text-slate-900">
                        {idx + 1}. {q.question}
                      </h4>
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIdx) => (
                          <label 
                            key={optIdx} 
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              selectedAnswers[q.id] === optIdx 
                                ? 'bg-purple-50 border-[#5051F9] text-[#5051F9] font-bold shadow-2xs' 
                                : 'bg-[#F8F9FD] border-slate-200/70 hover:bg-white text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              checked={selectedAnswers[q.id] === optIdx}
                              onChange={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              className="accent-[#5051F9]"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button 
                    onClick={submitQuiz} 
                    disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                    className="w-full py-2.5 bg-[#5051F9] hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-full cursor-pointer shadow-xs mt-4"
                  >
                    Submit Mastery Check 🚀
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
