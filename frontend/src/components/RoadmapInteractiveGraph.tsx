import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { SkillNode, type SkillNodeData } from './graph/SkillNode';
import { AnimatedBeamEdge } from './graph/AnimatedBeamEdge';
import { SkillDetailDrawer } from './graph/SkillDetailDrawer';
import { 
  Maximize2, Minimize2, 
  CheckCircle2, Zap, Lock, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoadmapInteractiveGraphProps {
  roadmapTitle?: string;
  milestones?: Array<{
    id?: string;
    title: string;
    description?: string;
    orderIndex: number;
    items: Array<{
      id: string;
      status: string;
      aiExplanation?: string;
      catalogItem?: {
        id?: string;
        title: string;
        description?: string;
        format?: string;
        difficulty?: string;
        estimatedHours?: number;
        url?: string;
        skills?: string[];
      };
    }>;
  }>;
  onItemStatusChange?: (itemId: string, currentStatus: string, newStatus: string) => void;
  onAskAi?: (topic: string) => void;
  onTestOut?: (skill: SkillNodeData) => void;
}

const nodeTypes = {
  skillNode: SkillNode,
};

const edgeTypes = {
  animatedBeam: AnimatedBeamEdge,
};

export const RoadmapInteractiveGraph: React.FC<RoadmapInteractiveGraphProps> = ({
  roadmapTitle = 'Career Prerequisite DAG',
  milestones = [],
  onItemStatusChange,
  onAskAi,
  onTestOut
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillNodeData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activePhaseFilter, setActivePhaseFilter] = useState<number | 'ALL'>('ALL');

  // Compute graph statistics
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let locked = 0;

    milestones.forEach((m) => {
      m.items?.forEach((item) => {
        total++;
        if (item.status === 'COMPLETED') completed++;
        else if (item.status === 'IN_PROGRESS') inProgress++;
        else locked++;
      });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, locked, percent };
  }, [milestones]);

  // Salary Multiplier and Community Score Generators
  const getSalaryImpact = (difficulty?: string, phaseNum: number = 1): string => {
    if (difficulty === 'advanced' || phaseNum >= 3) return '+28% Salary';
    if (difficulty === 'intermediate' || phaseNum === 2) return '+18% Salary';
    return '+10% Baseline';
  };

  const getCommunityRating = (title: string): number => {
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
    return 4.7 + (Math.abs(hash % 30) / 100);
  };

  // Build Topological Nodes & Energy Flow Edges
  useEffect(() => {
    if (!milestones || milestones.length === 0) return;

    const graphNodes: Node<SkillNodeData>[] = [];
    const graphEdges: Edge[] = [];

    const columnSpacing = 320;
    const rowSpacing = 140;

    let previousPhaseNodes: string[] = [];

    milestones.forEach((m, mIdx) => {
      const phaseNum = m.orderIndex || mIdx + 1;
      const cleanPhaseTitle = m.title.replace(/Phase \d+:\s*/i, '').trim();
      const currentPhaseNodes: string[] = [];
      const items = m.items || [];

      // Check if previous phase is mastered
      const isPrevPhaseDone = mIdx === 0 || (
        milestones[mIdx - 1]?.items?.every((it) => it.status === 'COMPLETED') ?? false
      );

      items.forEach((item, iIdx) => {
        const catItem = item.catalogItem || ({} as any);
        const nodeId = item.id || `node-${mIdx}-${iIdx}`;
        currentPhaseNodes.push(nodeId);

        const isCompleted = item.status === 'COMPLETED';
        const isInProgress = item.status === 'IN_PROGRESS';
        
        let derivedStatus: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'NOT_STARTED' = 'LOCKED';
        if (isCompleted) {
          derivedStatus = 'COMPLETED';
        } else if (isInProgress) {
          derivedStatus = 'IN_PROGRESS';
        } else {
          // If previous phase is done, or it's the first few items, unlock them
          if (isPrevPhaseDone && (iIdx === 0 || items[iIdx - 1]?.status === 'COMPLETED')) {
            derivedStatus = 'IN_PROGRESS';
          } else {
            derivedStatus = 'LOCKED';
          }
        }

        const isProject = catItem.format === 'PROJECT' || iIdx === 0;
        const salaryMult = getSalaryImpact(catItem.difficulty, phaseNum);
        const rating = getCommunityRating(catItem.title || nodeId);

        const nodeData: SkillNodeData = {
          id: item.id,
          title: catItem.title || `Skill ${phaseNum}.${iIdx + 1}`,
          phaseNum,
          phaseTitle: cleanPhaseTitle,
          orderIndex: iIdx,
          status: derivedStatus,
          format: catItem.format,
          difficulty: catItem.difficulty,
          estimatedHours: catItem.estimatedHours || (isProject ? 8 : 5),
          skills: catItem.skills || [],
          description: catItem.description,
          aiExplanation: item.aiExplanation,
          url: catItem.url,
          salaryMultiplier: salaryMult,
          communityRating: rating,
          isProject
        };

        // Layout positioning
        const xPos = mIdx * columnSpacing + 50;
        const yPos = iIdx * rowSpacing + 80;

        const isHidden = activePhaseFilter !== 'ALL' && activePhaseFilter !== phaseNum;

        graphNodes.push({
          id: nodeId,
          type: 'skillNode',
          position: { x: xPos, y: yPos },
          data: nodeData,
          hidden: isHidden,
        });

        // Intra-phase sequential dependency edge with Animated Beam
        if (iIdx > 0) {
          const prevItem = items[iIdx - 1];
          const prevNodeId = prevItem.id || `node-${mIdx}-${iIdx - 1}`;
          const isPrevDone = prevItem.status === 'COMPLETED';

          graphEdges.push({
            id: `edge-${prevNodeId}-${nodeId}`,
            source: prevNodeId,
            target: nodeId,
            type: 'animatedBeam',
            data: {
              status: isPrevDone ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'LOCKED',
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: isPrevDone ? '#10b981' : isInProgress ? '#6366f1' : '#475569',
              width: 14,
              height: 14,
            },
          });
        }
      });

      // Inter-phase bridge edges with Animated Light Beams
      if (previousPhaseNodes.length > 0 && currentPhaseNodes.length > 0) {
        const sourceBridgeNode = previousPhaseNodes[previousPhaseNodes.length - 1];
        const targetBridgeNode = currentPhaseNodes[0];
        const prevPhaseCompleted = milestones[mIdx - 1]?.items?.every(it => it.status === 'COMPLETED') ?? false;

        graphEdges.push({
          id: `bridge-${sourceBridgeNode}-${targetBridgeNode}`,
          source: sourceBridgeNode,
          target: targetBridgeNode,
          type: 'animatedBeam',
          data: {
            status: prevPhaseCompleted ? 'COMPLETED' : 'LOCKED',
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: prevPhaseCompleted ? '#10b981' : '#334155',
            width: 16,
            height: 16,
          },
        });
      }

      previousPhaseNodes = currentPhaseNodes;
    });

    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [milestones, activePhaseFilter]);

  // Handle Node Click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.data) {
      setSelectedSkill(node.data as SkillNodeData);
    }
  }, []);

  // Keyboard shortcut to close fullscreen / drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedSkill) setSelectedSkill(null);
        else if (isFullscreen) setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSkill, isFullscreen]);

  return (
    <div
      className={`relative flex flex-col rounded-3xl border border-slate-800 bg-slate-950/95 overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none h-screen w-screen'
          : 'w-full h-[640px] shadow-2xl'
      }`}
    >
      {/* Top HUD Bar */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 z-10 backdrop-blur-md">
        
        {/* Left Title & Live Energy Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-1.5">
              <span>{roadmapTitle} (DAG)</span>
              <span className="text-[10px] text-cyan-400 font-mono">
                ({stats.percent}% Mastered)
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">
              Interactive prerequisite tree with pulsing energy lines
            </p>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActivePhaseFilter('ALL')}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              activePhaseFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Phases
          </button>
          {milestones.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhaseFilter(idx + 1)}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activePhaseFilter === idx + 1
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Phase {idx + 1}
            </button>
          ))}
        </div>

        {/* Right Controls: Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-xs font-bold bg-slate-900/90 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                <span>Fullscreen Canvas</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full h-full relative bg-[#060913]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          className="bg-dot-grid"
        >
          {/* Subtle Cyber Grid Background */}
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={20} 
            size={1.5} 
            color="#334155" 
          />

          {/* Standard Navigation Controls */}
          <Controls 
            position="bottom-left"
            className="!bg-slate-900/90 !border-slate-800 !rounded-xl !shadow-xl [&>button]:!border-slate-800 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-800"
          />

          {/* MiniMap for Navigation */}
          <MiniMap
            position="bottom-right"
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              const data = node.data as SkillNodeData;
              if (data?.status === 'COMPLETED') return '#10b981';
              if (data?.status === 'IN_PROGRESS') return '#6366f1';
              return '#1e293b';
            }}
            maskColor="rgba(15, 23, 42, 0.75)"
            className="!bg-slate-950 !border !border-slate-800 !rounded-2xl !shadow-2xl overflow-hidden"
          />

          {/* Legend Banner Panel */}
          <Panel position="top-left" className="m-4">
            <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 backdrop-blur-md text-[10px] font-bold text-slate-300 shadow-lg">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" /> Mastered
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-indigo-400">
                <Zap className="w-3 h-3" /> In Progress
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Lock className="w-3 h-3" /> Locked
              </span>
            </div>
          </Panel>
        </ReactFlow>

        {/* Skill Analytics Drawer */}
        <SkillDetailDrawer
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onStatusChange={(nodeId, currentStatus, newStatus) => {
            if (onItemStatusChange) {
              onItemStatusChange(nodeId, currentStatus, newStatus);
            }
            if (selectedSkill && selectedSkill.id === nodeId) {
              setSelectedSkill({
                ...selectedSkill,
                status: newStatus as any
              });
            }
          }}
          onAskAi={onAskAi}
          onTestOut={onTestOut}
        />
      </div>

      {/* Canvas Bottom Status Bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3 font-medium">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {stats.completed} Done
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-indigo-400 font-bold">
            <Zap className="w-3.5 h-3.5" />
            {stats.inProgress} Working
          </span>
          <span>•</span>
          <span className="text-slate-500">
            {stats.locked} Remaining
          </span>
        </div>

        <span className="text-[10px] text-slate-400 font-mono">
          Scroll to zoom • Drag to pan • Click node to inspect
        </span>
      </div>
    </div>
  );
};

export default RoadmapInteractiveGraph;
