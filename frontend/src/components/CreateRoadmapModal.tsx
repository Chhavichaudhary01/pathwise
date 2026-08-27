import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, Compass, ArrowRight } from 'lucide-react';
import api from '@/lib/api';

interface CreateRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoadmapCreated?: (newRoadmap: any) => void;
}

const POPULAR_SUGGESTIONS = [
  { role: 'Full Stack Web Developer', icon: '⚡', desc: 'React, Node.js, PostgreSQL & Cloud Deploy' },
  { role: 'AI & LLM Engineer', icon: '🤖', desc: 'Python, LangChain, Vectors, RAG & PyTorch' },
  { role: 'DevOps & Cloud Architect', icon: '☁️', desc: 'Docker, Kubernetes, CI/CD, AWS & Terraform' },
  { role: 'Backend Engineer (Java/Spring)', icon: '🛠️', desc: 'Spring Boot, Microservices, PostgreSQL & Kafka' },
  { role: 'Frontend & UI Architect', icon: '💻', desc: 'React, Next.js, TypeScript & Tailwind CSS' },
  { role: 'Cybersecurity & Ethical Hacker', icon: '🛡️', desc: 'Network Security, Penetration Testing & OWASP' },
  { role: 'Rust Systems Programmer', icon: '🦀', desc: 'Memory Safety, Concurrency, WebAssembly & Async' },
  { role: 'Data Scientist & ML Specialist', icon: '📊', desc: 'Pandas, Scikit-Learn, Deep Learning & SQL' },
];

export default function CreateRoadmapModal({
  isOpen,
  onClose,
  onRoadmapCreated
}: CreateRoadmapModalProps) {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGenerate = async (targetGoal: string) => {
    const cleanGoal = targetGoal.trim();
    if (!cleanGoal) {
      setError('Please enter a target career role or skill.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.post('/roadmaps/generate', { goal: cleanGoal });
      const newRoadmap = res.data;
      if (onRoadmapCreated) {
        onRoadmapCreated(newRoadmap);
      }
      onClose();
      if (newRoadmap?.id) {
        navigate(`/roadmap/${newRoadmap.id}`);
      } else {
        navigate('/roadmap');
      }
    } catch (err: any) {
      console.error('Failed to generate custom roadmap:', err);
      setError(err.response?.data?.message || 'Failed to synthesize roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4F46E5] via-[#5051F9] to-[#6366F1] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white leading-tight">Create Custom AI Roadmap</h2>
              <p className="text-xs text-blue-100">Synthesize a prerequisite-resolved 3-phase curriculum for any career goal.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-left">
          
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Custom Input */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#5051F9]" />
              <span>What do you want to learn or become?</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Solidity Smart Contract Auditor, Rust Distributed Systems, iOS Swift Engineer..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleGenerate(goal);
                }}
                disabled={loading}
                className="w-full bg-[#F8F9FD] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-2xl pl-4 pr-32 py-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5051F9]/30 focus:border-[#5051F9]"
              />
              <button
                type="button"
                onClick={() => handleGenerate(goal)}
                disabled={loading || !goal.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#5051F9] hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Generate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Suggestions Strip */}
          <div className="space-y-2.5 pt-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Or Choose from Popular Tracks
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {POPULAR_SUGGESTIONS.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleGenerate(item.role)}
                  disabled={loading}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-[#5051F9] dark:hover:border-indigo-400 hover:shadow-sm text-left transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <span className="text-xl p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#5051F9] dark:group-hover:text-indigo-400 truncate">
                      {item.role}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* AI Features Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 text-[11px] text-indigo-900 dark:text-indigo-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#5051F9] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              PathWise will topologically sort your curriculum into <strong>Foundations</strong>, <strong>Hands-on Projects</strong>, and <strong>Mastery Capstones</strong> with automated sandbox skill assessments.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
