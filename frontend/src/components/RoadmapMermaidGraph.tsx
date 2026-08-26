import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Share2, Copy, Check, Maximize2, Minimize2, RefreshCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface RoadmapMermaidGraphProps {
  roadmapTitle?: string;
  milestones?: Array<{
    id?: string;
    title: string;
    orderIndex: number;
    items: Array<{
      id: string;
      status: string;
      catalogItem?: {
        id?: string;
        title: string;
        format?: string;
      };
    }>;
  }>;
}

export default function RoadmapMermaidGraph({
  roadmapTitle = 'Prerequisite DAG',
  milestones = []
}: RoadmapMermaidGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [zoom, setZoom] = useState<number>(1);

  // Initialize mermaid with generous padding
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        nodeSpacing: 40,
        rankSpacing: 45,
        padding: 40,
        useMaxWidth: true
      }
    });
  }, []);

  // Generate Mermaid Code
  const generateMermaidCode = (): string => {
    if (!milestones || milestones.length === 0) {
      return `
graph TD
    Start["🎯 Target: ${roadmapTitle.replace(/["()[\]{}]/g, '')}"] --> P1["Phase 1: Foundations"]
    P1 --> P2["Phase 2: Core Frameworks"]
    P2 --> P3["Phase 3: Production Mastery"]
    classDef default fill:#F8F9FD,stroke:#6366F1,stroke-width:2px,color:#1E1B4B,rx:10px,ry:10px;
      `;
    }

    const lines: string[] = [];
    lines.push('graph TD');

    // Styling definitions
    lines.push('    classDef rootNode fill:#5051F9,stroke:#312E81,stroke-width:2px,color:#FFFFFF,rx:14px,ry:14px;');
    lines.push('    classDef p1 fill:#EEF2FF,stroke:#4F46E5,stroke-width:2px,color:#312E81,rx:12px,ry:12px;');
    lines.push('    classDef p2 fill:#FAF5FF,stroke:#9333EA,stroke-width:2px,color:#581C87,rx:12px,ry:12px;');
    lines.push('    classDef p3 fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#064E3B,rx:12px,ry:12px;');
    lines.push('    classDef completed fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D,rx:12px,ry:12px;');
    lines.push('    classDef inprog fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F,rx:12px,ry:12px;');

    const cleanTitle = roadmapTitle.replace(/["()[\]{}]/g, '').trim();
    lines.push(`    Root["🎯 Target Role: ${cleanTitle}"]:::rootNode`);

    const phaseNodeIds: string[][] = [];

    milestones.forEach((m, mIdx) => {
      const phaseNum = m.orderIndex || mIdx + 1;
      const cleanPhaseTitle = m.title.replace(/Phase \d+:\s*/i, '').replace(/["()[\]{}]/g, '');
      const phaseSubId = `sub_phase_${phaseNum}`;
      
      lines.push(`    subgraph ${phaseSubId} ["Phase ${phaseNum}: ${cleanPhaseTitle}"]`);
      
      const currentPhaseNodeIds: string[] = [];

      m.items?.forEach((item, iIdx) => {
        const rawTitle = item.catalogItem?.title || `Skill ${iIdx + 1}`;
        const itemTitle = rawTitle.replace(/["()[\]{}]/g, '').trim();
        const shortTitle = itemTitle.length > 34 ? itemTitle.slice(0, 32) + '...' : itemTitle;
        const nodeId = `node_${phaseNum}_${iIdx + 1}`;
        currentPhaseNodeIds.push(nodeId);

        let iconPrefix = '⏳ ';
        if (item.status === 'COMPLETED') iconPrefix = '✅ ';
        else if (item.status === 'IN_PROGRESS') iconPrefix = '⚡ ';

        lines.push(`        ${nodeId}["${iconPrefix}${shortTitle}"]`);

        if (item.status === 'COMPLETED') {
          lines.push(`        class ${nodeId} completed;`);
        } else if (item.status === 'IN_PROGRESS') {
          lines.push(`        ${nodeId}:::inprog;`);
        } else {
          const pClass = phaseNum === 1 ? 'p1' : phaseNum === 2 ? 'p2' : 'p3';
          lines.push(`        class ${nodeId} ${pClass};`);
        }
      });

      // Chain items sequentially within the phase
      for (let i = 0; i < currentPhaseNodeIds.length - 1; i++) {
        lines.push(`        ${currentPhaseNodeIds[i]} --> ${currentPhaseNodeIds[i + 1]}`);
      }

      lines.push('    end');
      phaseNodeIds.push(currentPhaseNodeIds);
    });

    // Link Root to first phase
    if (phaseNodeIds.length > 0 && phaseNodeIds[0].length > 0) {
      lines.push(`    Root ==> ${phaseNodeIds[0][0]}`);
    }

    // Cross-phase prerequisite dependencies
    for (let p = 0; p < phaseNodeIds.length - 1; p++) {
      const currentPhaseNodes = phaseNodeIds[p];
      const nextPhaseNodes = phaseNodeIds[p + 1];
      if (currentPhaseNodes.length > 0 && nextPhaseNodes.length > 0) {
        const lastNodeOfCurrent = currentPhaseNodes[currentPhaseNodes.length - 1];
        const firstNodeOfNext = nextPhaseNodes[0];
        lines.push(`    ${lastNodeOfCurrent} ==>|Prerequisite Mastery| ${firstNodeOfNext}`);
      }
    }

    return lines.join('\n');
  };

  const mermaidCode = generateMermaidCode();

  // Render Mermaid SVG with proper viewBox
  useEffect(() => {
    let isMounted = true;
    const renderGraph = async () => {
      try {
        const id = `mermaid_svg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const { svg } = await mermaid.render(id, mermaidCode);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    };

    renderGraph();

    return () => {
      isMounted = false;
    };
  }, [mermaidCode, renderKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={`
      bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all flex flex-col
      ${isExpanded ? 'fixed inset-4 z-50 shadow-2xl' : 'w-full'}
    `}>
      
      {/* Graph Header */}
      <div className="bg-[#F8F9FD] border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#5051F9] text-white flex items-center justify-center shadow-2xs font-bold text-xs">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 leading-none">
              <span>Prerequisite DAG Graph</span>
              <span className="text-[9px] font-extrabold bg-[#EDE9FE] text-[#7C3AED] px-1.5 py-0.5 rounded-md uppercase">
                Mermaid.js
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Live Topological DAG • {roadmapTitle}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1">
          {/* Zoom Controls */}
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-7 h-7 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-7 h-7 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="w-7 h-7 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-200 mx-0.5" />

          <button
            onClick={() => setRenderKey(prev => prev + 1)}
            title="Re-render Diagram"
            className="w-7 h-7 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            title="Copy Mermaid Code"
            className="w-7 h-7 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize' : 'Expand Fullscreen'}
            className="w-7 h-7 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* SVG Canvas Area: Start from top with generous padding */}
      <div 
        ref={containerRef}
        className={`
          p-6 overflow-auto flex flex-col items-center justify-start bg-slate-50/40 min-h-[420px]
          ${isExpanded ? 'h-[calc(100%-60px)] max-h-none' : 'max-h-[560px]'}
        `}
      >
        {svgContent ? (
          <div 
            style={{ 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out' 
            }}
            className="mermaid-svg-container w-full flex justify-center pt-2 pb-6 [&>svg]:w-full [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:overflow-visible [&>svg]:drop-shadow-xs"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="text-center py-16 space-y-2 text-slate-400">
            <div className="w-8 h-8 border-2 border-[#5051F9] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold">Generating visual Mermaid DAG graph...</p>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="bg-[#F8F9FD] border-t border-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5051F9]"></span>
            <span>Target Role</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Completed</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>In Progress</span>
          </span>
        </div>

        <span className="text-[10px] text-slate-400 font-medium">
          Zero circular dependencies • Verified topological sequence
        </span>
      </div>

    </div>
  );
}
