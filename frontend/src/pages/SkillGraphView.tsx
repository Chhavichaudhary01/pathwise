import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/lib/api';

interface DynamicSkillNode {
  id: string;
  name: string;
  category: string;
  status: 'MASTERED' | 'IN_PROGRESS' | 'LOCKED';
  prereqs: string[];
  demand: 'HIGH' | 'EMERGING' | 'NICHE';
  difficulty: string;
  format: string;
  url?: string;
  description?: string;
  x: number;
  y: number;
}

export default function SkillGraphView() {
  const navigate = useNavigate();
  const [nodes, setNodes] = useState<DynamicSkillNode[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<DynamicSkillNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [roadmapTitle, setRoadmapTitle] = useState<string>("Career Learning Path");

  useEffect(() => {
    api.get('/roadmaps')
      .then((res) => {
        const roadmaps = res.data || [];
        if (roadmaps.length > 0) {
          const active = roadmaps[0];
          setRoadmapTitle(active.title || "Personalized Skill Graph");
          
          const builtNodes: DynamicSkillNode[] = [];
          const milestones = active.milestones || [];
          
          let prevNodeId: string | null = null;
          let col = 0;

          milestones.forEach((m: any, mIdx: number) => {
            const items = m.items || [];
            items.forEach((item: any, iIdx: number) => {
              const catItem = item.catalogItem || {};
              const nodeId = item.id || `node-${mIdx}-${iIdx}`;
              const skillName = (catItem.skills && catItem.skills.length > 0) 
                ? catItem.skills.join(' / ') 
                : (catItem.title || `Skill ${mIdx + 1}.${iIdx + 1}`);

              const status: 'MASTERED' | 'IN_PROGRESS' | 'LOCKED' = 
                item.status === 'COMPLETED' ? 'MASTERED' : 
                item.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'LOCKED';

              // Calculate layout coordinates
              const x = 70 + (col * 190);
              const y = (iIdx % 2 === 0) ? 110 : 210;

              const prereqs: string[] = prevNodeId ? [prevNodeId] : [];
              prevNodeId = skillName;

              builtNodes.push({
                id: nodeId,
                name: skillName,
                category: m.title ? m.title.split(':')[0] : `Phase ${mIdx + 1}`,
                status,
                prereqs,
                demand: (catItem.difficulty === 'advanced' || mIdx >= 2) ? 'EMERGING' : 'HIGH',
                difficulty: catItem.difficulty || 'beginner',
                format: catItem.format || 'course',
                url: catItem.url || 'https://developer.mozilla.org',
                description: catItem.description || item.aiExplanation || 'Core prerequisite topic.',
                x,
                y
              });
              col++;
            });
          });

          setNodes(builtNodes);
          if (builtNodes.length > 0) {
            setSelectedSkill(builtNodes[0]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-600 mb-2">
              &larr; Back to Dashboard
            </Button>
            <h1 className="text-3xl font-extrabold text-slate-900">Skill Graph (Prerequisite DAG)</h1>
            <p className="text-slate-600 text-sm">
              Live Directed Acyclic Graph showing prerequisite sequencing for <strong className="text-slate-900">{roadmapTitle}</strong>.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> Mastered</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> In Progress</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-300"></span> Locked</span>
          </div>
        </div>

        {/* Graph Canvas Card */}
        <Card className="border shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-slate-900 text-white py-4 px-6">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg text-white">Dynamic Topological Prerequisite Pipeline</CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Click any node to inspect prerequisite relations, market demand, and learning resources.
                </CardDescription>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full font-semibold">
                DAG Topological Sorted
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-8 overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-slate-500">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Rendering dynamic skill DAG...
              </div>
            ) : nodes.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="text-4xl">🕸️</div>
                <h3 className="text-base font-bold text-slate-800">No Active Skill Graph</h3>
                <p className="text-xs text-slate-500">Generate a learning roadmap first to populate your personalized skill graph.</p>
                <Button onClick={() => navigate('/onboarding')} size="sm">Create Roadmap</Button>
              </div>
            ) : (
              <div 
                className="relative bg-slate-50 rounded-xl border border-dashed border-slate-200"
                style={{ minWidth: `${Math.max(900, nodes.length * 200)}px`, height: '360px' }}
              >
                
                {/* SVG Connector Arrows */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                    </marker>
                  </defs>

                  {nodes.map((node, idx) => {
                    if (idx === 0) return null;
                    const prev = nodes[idx - 1];
                    return (
                      <line 
                        key={idx}
                        x1={prev.x + 80} 
                        y1={prev.y} 
                        x2={node.x} 
                        y2={node.y} 
                        stroke="#94a3b8" 
                        strokeWidth="2" 
                        markerEnd="url(#arrow)" 
                      />
                    );
                  })}
                </svg>

                {/* Node Chips */}
                {nodes.map((node) => {
                  const isSelected = selectedSkill?.id === node.id;
                  const statusColor = 
                    node.status === 'MASTERED' 
                      ? 'border-green-500 bg-green-50 text-green-900 shadow-green-100' 
                      : node.status === 'IN_PROGRESS' 
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-blue-100' 
                        : 'border-slate-300 bg-white text-slate-500 opacity-80';

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedSkill(node)}
                      style={{ left: `${node.x}px`, top: `${node.y - 32}px` }}
                      className={`absolute z-10 p-3 rounded-xl border-2 shadow-md transition-all cursor-pointer text-left w-44 ${statusColor} ${
                        isSelected ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">{node.category}</span>
                        <span className="text-[9px] bg-slate-200 px-1 py-0.5 rounded font-bold">
                          {node.demand}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs mt-1 line-clamp-2">{node.name}</h4>
                      <span className="text-[10px] font-medium block mt-1">
                        {node.status === 'MASTERED' ? '✓ Mastered' : node.status === 'IN_PROGRESS' ? '⚡ In Progress' : '🔒 Locked'}
                      </span>
                    </button>
                  );
                })}

              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Skill Details Panel */}
        {selectedSkill && (
          <Card className="border shadow-sm bg-white">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Skill Node Details</span>
                  <CardTitle className="text-xl font-bold text-slate-900 mt-1">{selectedSkill.name}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{selectedSkill.description}</CardDescription>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                  selectedSkill.status === 'MASTERED' ? 'bg-green-100 text-green-800' : selectedSkill.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {selectedSkill.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Phase Group</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedSkill.category}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Difficulty & Format</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5 uppercase">{selectedSkill.difficulty} • {selectedSkill.format}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Hiring Demand</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{selectedSkill.demand} Market Demand</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border flex flex-col justify-between">
                  <span className="text-xs text-slate-500 font-semibold uppercase">External Material</span>
                  {selectedSkill.url ? (
                    <a href={selectedSkill.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline">
                      Open Resource &rarr;
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">Standard Module</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
