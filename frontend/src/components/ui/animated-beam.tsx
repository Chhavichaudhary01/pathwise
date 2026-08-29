import React, { useEffect, useId, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  repeat?: number;
  repeatDelay?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  status?: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  pathColor = "currentColor",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor,
  gradientStopColor,
  repeat = Infinity,
  repeatDelay = 0,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  status = 'IN_PROGRESS',
}) => {
  const id = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Intelligent preset styling based on PathWise status
  const startColor = gradientStartColor || (
    status === 'COMPLETED' ? '#10B981' : status === 'IN_PROGRESS' ? '#6366F1' : '#475569'
  );

  const stopColor = gradientStopColor || (
    status === 'COMPLETED' ? '#06B6D4' : status === 'IN_PROGRESS' ? '#A855F7' : '#334155'
  );

  const baseTrackColor = status === 'COMPLETED' 
    ? 'rgba(16, 185, 129, 0.25)' 
    : status === 'IN_PROGRESS' 
    ? 'rgba(99, 102, 241, 0.25)' 
    : 'rgba(51, 65, 85, 0.2)';

  const gradientCoordinates = reverse
    ? {
        x1: ["90%", "-10%"],
        x2: ["100%", "0%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }
    : {
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      };

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        const controlY = startY - curvature;
        const d = `M ${startX},${startY} Q ${
          (startX + endX) / 2
        },${controlY} ${endX},${endY}`;
        setPathD(d);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updatePath();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updatePath();

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  const isLocked = status === 'LOCKED';

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute top-0 left-0 transform-gpu stroke-2",
        className
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      {/* Background Track Line */}
      <path
        d={pathD}
        stroke={pathColor !== "currentColor" ? pathColor : baseTrackColor}
        strokeWidth={pathWidth}
        strokeOpacity={isLocked ? 0.3 : pathOpacity}
        strokeDasharray={isLocked ? "4,4" : undefined}
        strokeLinecap="round"
      />

      {/* Pulsing Gradient Laser Beam */}
      {!isLocked && (
        <path
          d={pathD}
          strokeWidth={status === 'COMPLETED' ? pathWidth + 1 : pathWidth}
          stroke={`url(#${id})`}
          strokeOpacity="1"
          strokeLinecap="round"
        />
      )}

      <defs>
        <motion.linearGradient
          className="transform-gpu"
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{
            x1: "0%",
            x2: "0%",
            y1: "0%",
            y2: "0%",
          }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: gradientCoordinates.y1,
            y2: gradientCoordinates.y2,
          }}
          transition={{
            delay,
            duration,
            ease: [0.16, 1, 0.3, 1],
            repeat,
            repeatDelay,
          }}
        >
          <stop stopColor={startColor} stopOpacity="0"></stop>
          <stop stopColor={startColor}></stop>
          <stop offset="32.5%" stopColor={stopColor}></stop>
          <stop offset="100%" stopColor={stopColor} stopOpacity="0"></stop>
        </motion.linearGradient>
      </defs>
    </svg>
  );
};

export default AnimatedBeam;
