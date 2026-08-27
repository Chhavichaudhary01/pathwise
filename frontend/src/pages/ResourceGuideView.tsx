import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  Code2, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  Share2,
  Terminal
} from 'lucide-react';
import api from '@/lib/api';
import ProofOfSkillModal from '@/components/sandbox/ProofOfSkillModal';

interface CodeExample {
  title: string;
  language: string;
  filename: string;
  code: string;
  explanation: string;
}

interface Exercise {
  title: string;
  description: string;
  difficulty: string;
  starterCode?: string;
}

interface DocReference {
  title: string;
  domain: string;
  url: string;
  description: string;
}

interface ResourceGuide {
  topic: string;
  category: string;
  difficulty: string;
  estimatedReadTime: string;
  summary: string;
  prerequisites: string[];
  learningObjectives: string[];
  deepDiveMarkdown: string;
  codeExamples: CodeExample[];
  commonPitfalls: string[];
  bestPractices: string[];
  practicalExercises: Exercise[];
  authoritativeCitations: DocReference[];
  roadmapItemId?: string;
  roadmapItemStatus?: string;
}

export default function ResourceGuideView() {
  const { topicSlug } = useParams<{ topicSlug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract topic & optional itemId from query params or route params or state
  const queryParams = new URLSearchParams(location.search);
  const rawTopic = topicSlug || queryParams.get('topic') || (location.state as any)?.topic || 'React.js & Hooks';
  const itemId = queryParams.get('itemId') || (location.state as any)?.itemId;

  const [guide, setGuide] = useState<ResourceGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'GUIDE' | 'CODE' | 'PITFALLS' | 'EXERCISES' | 'DOCS'>('GUIDE');
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [itemStatus, setItemStatus] = useState<string>('TODO');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Sandbox Modal State
  const [sandboxModalOpen, setSandboxModalOpen] = useState(false);

  useEffect(() => {
    fetchGuideData(rawTopic, itemId);
  }, [rawTopic, itemId]);

  const fetchGuideData = async (topic: string, id?: string) => {
    setLoading(true);
    try {
      const url = id 
        ? `/resources/guide?topic=${encodeURIComponent(topic)}&itemId=${encodeURIComponent(id)}`
        : `/resources/guide?topic=${encodeURIComponent(topic)}`;
      const res = await api.get(url);
      setGuide(res.data);
      if (res.data.roadmapItemStatus) {
        setItemStatus(res.data.roadmapItemStatus);
      }
    } catch (err) {
      console.error('Failed to load resource guide:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!itemId) return;
    setStatusUpdating(true);
    const newStatus = itemStatus === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';
    try {
      await api.put(`/roadmaps/items/${itemId}/status`, { status: newStatus });
      setItemStatus(newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAskAi = () => {
    navigate('/chat', {
      state: {
        initialMessage: `Can you explain the core concepts, mental models, and real-world edge cases for "${guide?.topic || rawTopic}"?`
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6 animate-in fade-in">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div className="w-24 h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
        </div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-2/3 animate-pulse"></div>
        <div className="h-32 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse col-span-2"></div>
          <div className="h-64 bg-slate-100 dark:bg-slate-800/60 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Learning Guide Not Found</h2>
        <p className="text-xs text-slate-500">We could not locate the structured guide for this skill topic.</p>
        <button
          onClick={() => navigate('/roadmap')}
          className="px-5 py-2.5 bg-[#5051F9] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-indigo-700"
        >
          Return to Active Roadmap
        </button>
      </div>
    );
  }

  const isCompleted = itemStatus === 'COMPLETED';

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 pb-24 text-slate-900 dark:text-slate-100 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#5051F9] text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#5051F9] transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Roadmap</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[#5051F9] transition-colors cursor-pointer shadow-2xs"
            title="Share Guide Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {/* Ask AI Tutor */}
          <button
            onClick={handleAskAi}
            className="px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[#5051F9] dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5051F9]" />
            <span>Ask AI Coach</span>
          </button>

          {/* Test Out in Sandbox CTA */}
          <button
            onClick={() => setSandboxModalOpen(true)}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>Test Out in Sandbox</span>
          </button>

          {/* Roadmap Completion Switcher */}
          {itemId && (
            <button
              onClick={handleToggleStatus}
              disabled={statusUpdating}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:border-emerald-500'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{isCompleted ? '✓ Completed' : 'Mark Completed'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-slate-900/0 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 border border-indigo-100 dark:border-indigo-900/50 shadow-sm space-y-4 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#5051F9]/10 text-[#5051F9] dark:text-indigo-300 text-[11px] font-mono font-black uppercase tracking-wider border border-[#5051F9]/20">
            {guide.category}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{guide.estimatedReadTime}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>PathWise Verified Curriculum</span>
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
          {guide.topic}
        </h1>

        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {guide.summary}
        </p>

        {/* Prerequisites & Objectives Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Prerequisite Foundations
            </span>
            <div className="flex flex-wrap gap-1.5">
              {guide.prerequisites.map((req, idx) => (
                <span key={idx} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {req}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Core Mastery Objectives
            </span>
            <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
              {guide.learningObjectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#5051F9] font-bold">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
        {[
          { id: 'GUIDE' as const, label: 'Deep Dive Guide', icon: BookOpen },
          { id: 'CODE' as const, label: `Code Snippets (${guide.codeExamples?.length || 0})`, icon: Code2 },
          { id: 'PITFALLS' as const, label: 'Pitfalls & Anti-Patterns', icon: AlertTriangle },
          { id: 'EXERCISES' as const, label: 'Practice Challenges', icon: Terminal },
          { id: 'DOCS' as const, label: 'Official References', icon: ExternalLink },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-t-2xl transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-t-2 border-x border-[#5051F9] border-x-slate-200 dark:border-x-slate-800 text-[#5051F9] dark:text-indigo-300 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#5051F9]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Content Display */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-2xs text-left min-h-[400px]">
        
        {/* 1. Deep Dive Guide Tab */}
        {activeTab === 'GUIDE' && (
          <div className="space-y-6 text-xs md:text-sm leading-relaxed max-w-4xl">
            <div className="prose dark:prose-invert max-w-none space-y-4">
              {guide.deepDiveMarkdown.split('\n\n').map((block, bIdx) => {
                if (block.startsWith('### ')) {
                  return (
                    <h3 key={bIdx} className="text-base md:text-lg font-black text-slate-900 dark:text-white pt-3 border-b border-slate-100 dark:border-slate-800 pb-1">
                      {block.replace('### ', '')}
                    </h3>
                  );
                }
                if (block.startsWith('- ')) {
                  const items = block.split('\n');
                  return (
                    <ul key={bIdx} className="space-y-1.5 pl-2">
                      {items.map((it, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2">
                          <span className="text-[#5051F9] font-bold">•</span>
                          <span>{it.replace(/^-\s*/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={bIdx} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {block}
                  </p>
                );
              })}
            </div>

            {/* Quick Sandbox Footer Callout */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/50 flex flex-wrap items-center justify-between gap-4 mt-8">
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Ready to verify your understanding?</span>
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Solve the interactive live coding challenge in the PathWise micro-sandbox to advance your DAG.
                </p>
              </div>
              <button
                onClick={() => setSandboxModalOpen(true)}
                className="px-4 py-2 bg-[#5051F9] hover:bg-indigo-700 text-white text-xs font-extrabold rounded-full shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch Interactive Sandbox</span>
                <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Code Snippets Tab */}
        {activeTab === 'CODE' && (
          <div className="space-y-6">
            {guide.codeExamples && guide.codeExamples.length > 0 ? (
              guide.codeExamples.map((snippet, sIdx) => (
                <div key={sIdx} className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                  {/* File Bar */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5 text-[#5051F9]" />
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{snippet.filename || snippet.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-mono">
                        {snippet.language}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(snippet.code, sIdx)}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {copiedCodeIdx === sIdx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Code Container */}
                  <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                    <code>{snippet.code}</code>
                  </pre>

                  {/* Explanation Footer */}
                  {snippet.explanation && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Architecture Note: </span>
                      {snippet.explanation}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No code examples registered for this guide.</p>
            )}
          </div>
        )}

        {/* 3. Pitfalls & Anti-Patterns Tab */}
        {activeTab === 'PITFALLS' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2 uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4" />
                <span>Common Pitfalls to Avoid</span>
              </h3>
              <div className="space-y-2">
                {guide.commonPitfalls.map((pit, pIdx) => (
                  <div key={pIdx} className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
                    <span className="text-rose-500 font-black text-sm">✕</span>
                    <p className="leading-relaxed">{pit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4" />
                <span>Production Best Practices</span>
              </h3>
              <div className="space-y-2">
                {guide.bestPractices.map((bp, bIdx) => (
                  <div key={bIdx} className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black text-sm">✓</span>
                    <p className="leading-relaxed">{bp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Practice Challenges Tab */}
        {activeTab === 'EXERCISES' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#5051F9]" />
              <span>Recommended Hands-on Projects</span>
            </h3>
            {guide.practicalExercises && guide.practicalExercises.length > 0 ? (
              guide.practicalExercises.map((ex, eIdx) => (
                <div key={eIdx} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{ex.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[#5051F9] dark:text-indigo-300">
                      {ex.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ex.description}
                  </p>
                  <button
                    onClick={() => setSandboxModalOpen(true)}
                    className="px-3.5 py-1.5 bg-[#5051F9] text-white text-xs font-bold rounded-xl hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>Launch in Sandbox</span>
                    <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Launch the sandbox above to complete active milestone verification.</p>
            )}
          </div>
        )}

        {/* 5. Authoritative References Tab */}
        {activeTab === 'DOCS' && (
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#5051F9]" />
              <span>Authoritative Documentation & Specifications</span>
            </h3>
            <p className="text-xs text-slate-500">
              Direct links to official language specifications, MDN web standards, and foundational RFCs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {guide.authoritativeCitations.map((doc, dIdx) => (
                <a
                  key={dIdx}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 hover:border-[#5051F9] transition-all group shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-bold text-[#5051F9]">{doc.domain}</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#5051F9]">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {doc.description}
                  </p>
                </a>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Proof-of-Skill Interactive Micro-Sandbox Modal */}
      <ProofOfSkillModal
        isOpen={sandboxModalOpen}
        onClose={() => setSandboxModalOpen(false)}
        skillName={guide.topic}
        topicTitle={guide.topic}
        roadmapItemId={itemId}
        onSuccess={() => {
          setItemStatus('COMPLETED');
        }}
      />

    </div>
  );
}
