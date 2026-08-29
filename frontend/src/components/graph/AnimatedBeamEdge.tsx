import React from 'react';
import { type EdgeProps, getBezierPath } from 'reactflow';

export interface AnimatedBeamEdgeData {
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED' | 'NOT_STARTED';
  color?: string;
  duration?: number;
  reverse?: boolean;
}

export const AnimatedBeamEdge: React.FC<EdgeProps<AnimatedBeamEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data = {},
  markerEnd
}) => {
  const status = data?.status || 'NOT_STARTED';
  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';

  // Compute smooth curved bezier path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25
  });

  // Unique IDs for SVG gradient and filter definitions
  const gradientId = `beam-grad-${id}`;
  const glowFilterId = `beam-glow-${id}`;
  const motionId = `motion-${id}`;

  const primaryColor = isCompleted
    ? '#10B981' // Emerald
    : isInProgress
    ? '#6366F1' // Indigo
    : '#475569'; // Slate

  const secondaryColor = isCompleted
    ? '#06B6D4' // Cyan
    : isInProgress
    ? '#A855F7' // Purple
    : '#334155';

  const beamPulseColor = isCompleted
    ? '#34D399'
    : isInProgress
    ? '#818CF8'
    : '#94A3B8';

  const strokeWidth = isCompleted ? 3 : isInProgress ? 2.5 : 1.5;
  const isAnimated = isCompleted || isInProgress;

  return (
    <>
      {/* SVG Definitions for Gradients, Glow Filters, and Traveling Particles */}
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
          <stop offset="0%" stopColor={primaryColor} stopOpacity={isCompleted ? 0.9 : isInProgress ? 0.8 : 0.4} />
          <stop offset="50%" stopColor={secondaryColor} stopOpacity={isCompleted ? 1 : isInProgress ? 0.9 : 0.4} />
          <stop offset="100%" stopColor={primaryColor} stopOpacity={isCompleted ? 0.9 : isInProgress ? 0.8 : 0.4} />
        </linearGradient>

        <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={isCompleted ? "3.5" : "2.5"} result="glow" />
          <feComposite in="SourceGraphic" in2="glow" operator="over" />
        </filter>
      </defs>

      {/* Background Soft Ambient Glow Layer */}
      {isAnimated && (
        <path
          d={edgePath}
          fill="none"
          stroke={primaryColor}
          strokeWidth={strokeWidth + 5}
          strokeOpacity={0.18}
          filter={`url(#${glowFilterId})`}
          className="pointer-events-none"
        />
      )}

      {/* Base Circuit Connecting Line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeDasharray={!isAnimated ? '6,6' : undefined}
        markerEnd={markerEnd}
        className="react-flow__edge-path transition-all duration-300"
        style={{
          ...style,
          strokeOpacity: !isAnimated ? 0.45 : 0.85
        }}
      />

      {/* 21st.dev Laser Particle Traveling Along the Beam */}
      {isAnimated && (
        <>
          {/* Pulsing Light Packet / Beam Capsule */}
          <circle r={isCompleted ? "4.5" : "3.5"} fill={beamPulseColor} filter={`url(#${glowFilterId})`}>
            <animateMotion
              id={motionId}
              path={edgePath}
              dur={isCompleted ? "2.2s" : "3s"}
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Trailing Comet Aura */}
          <circle r={isCompleted ? "2.5" : "2"} fill="#FFFFFF" opacity="0.95">
            <animateMotion
              path={edgePath}
              dur={isCompleted ? "2.2s" : "3s"}
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Second Offset Photon for Rapid Active Feedback */}
          {isInProgress && (
            <circle r="3" fill="#C084FC" opacity="0.8">
              <animateMotion
                path={edgePath}
                dur="3s"
                begin="1.5s"
                repeatCount="indefinite"
                rotate="auto"
              />
            </circle>
          )}
        </>
      )}
    </>
  );
};

export default AnimatedBeamEdge;
