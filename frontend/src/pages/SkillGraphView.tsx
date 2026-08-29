import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowLeft, 
  Layers, 
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import AnimatedBeamSkillTree from '@/components/graph/AnimatedBeamSkillTree';
import { RoadmapInteractiveGraph } from '@/components/RoadmapInteractiveGraph';
import ProofOfSkillModal from '@/components/sandbox/ProofOfSkillModal';

export default function SkillGraphView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'ANIMATED_BEAMS' | 'INTERACTIVE_DAG'>('ANIMATED_BEAMS');

  // Sandbox modal state
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [sandboxSkill, setSandboxSkill] = useState('');
  const [sandboxTopic, setSandboxTopic] = useState('');
  const [sandboxItemId, setSandboxItemId] = useState<string | null>(null);

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/roadmaps');
      const roadmaps = res.data || [];
      if (roadmaps.length > 0) {
        setActiveRoadmap(roadmaps[0]);
      }
    } catch (err) {
      console.error('Failed to load roadmaps for skill graph:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleItemStatusChange = async (itemId: string, _currentStatus: string, newStatus: string) => {
    try {
      await api.patch(`/roadmaps/items/${itemId}/status`, { status: newStatus });
      fetchRoadmaps();
    } catch (err) {
      console.error('Failed to update skill status:', err);
    }
  };

  const handleOpenSandbox = (skill: any) => {
    setSandboxSkill(skill.skills?.[0] || skill.title);
    setSandboxTopic(skill.title);
    setSandboxItemId(skill.id);
    setSandboxOpen(true);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto pb-12 text-left">
      
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 mb-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              ⚡ 21st.dev Component Pattern
            </span>
            <span className="text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              Topological DAG
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
            <span>Animated Skill Graph & Connecting Node Tree</span>
            <Sparkles className="w-5 h-5 text-[#5051F9]" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 max-w-2xl">
            Clean glassmorphic milestone nodes connected by glowing gradient SVG lines where light particles pulse along active learning paths.
          </p>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1 text-xs font-bold shadow-2xs">
            <button
              onClick={() => setViewMode('ANIMATED_BEAMS')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'ANIMATED_BEAMS'
                  ? 'bg-[#5051F9] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Animated Beams</span>
            </button>

            <button
              onClick={() => setViewMode('INTERACTIVE_DAG')}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'INTERACTIVE_DAG'
                  ? 'bg-[#5051F9] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full Flow Canvas</span>
            </button>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/roadmap')}
            className="rounded-full text-xs font-bold border-purple-200 dark:border-slate-700 text-[#5051F9] dark:text-indigo-400 hover:bg-purple-50 dark:hover:bg-slate-800"
          >
            <span>Milestone List</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-20 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-10 h-10 border-3 border-[#5051F9] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500">Synthesizing animated prerequisite beams and nodes...</p>
        </div>
      ) : !activeRoadmap ? (
        <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="text-4xl">🕸️</div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Active Career Graph Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Generate a personalized learning roadmap first to populate your interactive skill tree with animated beams.</p>
          <Button onClick={() => navigate('/onboarding')} className="rounded-full bg-[#5051F9] text-white font-bold text-xs">
            Create Roadmap 🚀
          </Button>
        </div>
      ) : viewMode === 'ANIMATED_BEAMS' ? (
        <AnimatedBeamSkillTree
          roadmapTitle={activeRoadmap.title}
          milestones={activeRoadmap.milestones}
          onItemStatusChange={handleItemStatusChange}
          onTestOut={handleOpenSandbox}
        />
      ) : (
        <div className="rounded-3xl border border-slate-800 overflow-hidden shadow-2xl h-[680px]">
          <RoadmapInteractiveGraph
            roadmapTitle={activeRoadmap.title}
            milestones={activeRoadmap.milestones}
            onItemStatusChange={handleItemStatusChange}
            onAskAi={(topic) => navigate('/chat', { state: { initialMessage: `Explain ${topic}` } })}
            onTestOut={handleOpenSandbox}
          />
        </div>
      )}

      {/* AI Proof of Skill Sandbox Modal */}
      <ProofOfSkillModal
        isOpen={sandboxOpen}
        onClose={() => setSandboxOpen(false)}
        skillName={sandboxSkill}
        topicTitle={sandboxTopic}
        roadmapItemId={sandboxItemId || undefined}
        onSuccess={() => {
          if (sandboxItemId) {
            handleItemStatusChange(sandboxItemId, 'IN_PROGRESS', 'COMPLETED');
          }
          setSandboxOpen(false);
        }}
      />

    </div>
  );
}
