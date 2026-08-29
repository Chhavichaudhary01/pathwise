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
  data = {},
}) => {
  const status = data?.status || 'NOT_STARTED';
  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';

  // Compute smooth curved bezier path with gentle curvature
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.2
  });

  const gradientId = `beam-grad-${id}`;
  const particleId = `particle-${id}`;

  const primaryColor = isCompleted
    ? '#10B981' // Emerald
    : isInProgress
    ? '#06B6D4' // Cyan
    : '#334155'; // Slate

  const secondaryColor = isCompleted
    ? '#06B6D4'
    : isInProgress
    ? '#6366F1'
    : '#1E293B';

  const strokeWidth = isCompleted ? 1.5 : isInProgress ? 1.5 : 1;
  const isAnimated = isCompleted || isInProgress;

  return (
    <>
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
          <stop offset="0%" stopColor={primaryColor} stopOpacity={isCompleted ? 0.8 : isInProgress ? 0.7 : 0.3} />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity={isCompleted ? 0.9 : isInProgress ? 0.8 : 0.3} />
        </linearGradient>
      </defs>

      {/* Slim, Crisp Base Circuit Track */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeDasharray={!isAnimated ? '4,4' : undefined}
        strokeLinecap="round"
        className="transition-colors duration-300"
      />

      {/* Delicate Traveling Light Particle Dot */}
      {isAnimated && (
        <circle r="2.2" fill={isCompleted ? '#34D399' : '#38BDF8'}>
          <animateMotion
            id={particleId}
            dur={isCompleted ? '3s' : '2.4s'}
            repeatCount="indefinite"
            path={edgePath}
            rotate="auto"
          />
        </circle>
      )}
    </>
  );
};

export default AnimatedBeamEdge;
