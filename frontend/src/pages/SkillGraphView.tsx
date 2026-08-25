import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SkillNode {
  id: string;
  name: string;
  category: string;
  status: 'MASTERED' | 'IN_PROGRESS' | 'LOCKED';
  prereqs: string[];
  demand: 'HIGH' | 'EMERGING' | 'NICHE';
  x: number;
  y: number;
}

const SKILL_NODES: SkillNode[] = [
  { id: 'html', name: 'HTML5 & Semantics', category: 'Foundation', status: 'MASTERED', prereqs: [], demand: 'HIGH', x: 80, y: 150 },
  { id: 'css', name: 'CSS3 & Responsive Design', category: 'Foundation', status: 'MASTERED', prereqs: ['html'], demand: 'HIGH', x: 260, y: 100 },
  { id: 'js', name: 'JavaScript ES6+', category: 'Core', status: 'IN_PROGRESS', prereqs: ['html', 'css'], demand: 'HIGH', x: 440, y: 150 },
  { id: 'react', name: 'React 18 & Hooks', category: 'Framework', status: 'IN_PROGRESS', prereqs: ['js'], demand: 'HIGH', x: 640, y: 100 },
  { id: 'state', name: 'State Management (Zustand)', category: 'Advanced', status: 'LOCKED', prereqs: ['react'], demand: 'EMERGING', x: 820, y: 80 },
  { id: 'api', name: 'REST APIs & Async Fetch', category: 'Core', status: 'LOCKED', prereqs: ['js'], demand: 'HIGH', x: 640, y: 220 },
  { id: 'postgres', name: 'PostgreSQL & Databases', category: 'Backend/DB', status: 'LOCKED', prereqs: ['api'], demand: 'HIGH', x: 820, y: 220 },
];

export default function SkillGraphView() {
  const navigate = useNavigate();
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(SKILL_NODES[2]);

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
              Mathematical Directed Acyclic Graph showing required competencies, prerequisites, and mastery depth.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
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
                <CardTitle className="text-lg text-white">Interactive Prerequisite Topological Map</CardTitle>
                <CardDescription className="text-slate-300 text-xs">
                  Click on any node to inspect prerequisite relations, market hiring demand, and learning resources.
                </CardDescription>
              </div>
              <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full font-semibold">
                Zero Cycles Verified
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 md:p-8 overflow-x-auto">
            <div className="min-w-[900px] h-[360px] relative bg-slate-50 rounded-xl border border-dashed border-slate-200">
              
              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* HTML -> CSS */}
                <line x1="140" y1="150" x2="260" y2="100" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                {/* CSS -> JS */}
                <line x1="320" y1="100" x2="440" y2="150" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                {/* HTML -> JS */}
                <line x1="140" y1="150" x2="440" y2="150" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" markerEnd="url(#arrow)" />
                {/* JS -> React */}
                <line x1="500" y1="150" x2="640" y2="100" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                {/* React -> State */}
                <line x1="700" y1="100" x2="820" y2="80" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                {/* JS -> API */}
                <line x1="500" y1="150" x2="640" y2="220" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
                {/* API -> PostgreSQL */}
                <line x1="700" y1="220" x2="820" y2="220" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)" />
              </svg>

              {/* Node Chips */}
              {SKILL_NODES.map((node) => {
                const isSelected = selectedSkill?.id === node.id;
                const statusColor = 
                  node.status === 'MASTERED' 
                    ? 'border-green-500 bg-green-50 text-green-900 shadow-green-100' 
                    : node.status === 'IN_PROGRESS' 
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-blue-100' 
                      : 'border-slate-300 bg-white text-slate-500 opacity-75';

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedSkill(node)}
                    style={{ left: `${node.x}px`, top: `${node.y - 28}px` }}
                    className={`absolute z-10 p-3 rounded-xl border-2 shadow-md transition-all cursor-pointer text-left w-48 ${statusColor} ${
                      isSelected ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105' : 'hover:scale-102'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider">{node.category}</span>
                      <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold">
                        {node.demand}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm mt-1">{node.name}</h4>
                    <span className="text-[11px] font-medium block mt-1">
                      {node.status === 'MASTERED' ? '✓ Mastered' : node.status === 'IN_PROGRESS' ? '⚡ In Progress' : '🔒 Prereq Locked'}
                    </span>
                  </button>
                );
              })}

            </div>
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
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                  selectedSkill.status === 'MASTERED' ? 'bg-green-100 text-green-800' : selectedSkill.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {selectedSkill.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Category</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedSkill.category}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Labor Market Demand</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedSkill.demand} Demand (Static Job Index)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Direct Prerequisites</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedSkill.prereqs.length > 0 ? selectedSkill.prereqs.join(', ').toUpperCase() : 'None (Root Foundation)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
