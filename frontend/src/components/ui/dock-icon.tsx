import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DockIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  magnification?: number;
  distance?: number;
  disableMagnification?: boolean;
  mouseX?: MotionValue<number>;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_SIZE = 42;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

export const DockIcon: React.FC<DockIconProps> = ({
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  disableMagnification = false,
  mouseX,
  className,
  children,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const padding = Math.max(6, size * 0.2);
  const fallbackMouseX = useMotionValue(Infinity);

  const distanceCalc = useTransform(mouseX ?? fallbackMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const targetSize = disableMagnification ? size : magnification;

  const sizeTransform = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [size, targetSize, size]
  );

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 160,
    damping: 14,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: scaleSize, height: scaleSize, padding }}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-2xl bg-slate-800/60 text-slate-300 hover:bg-slate-700/80 hover:text-white transition-colors duration-150 border border-slate-700/50 shadow-sm",
        className
      )}
      {...(props as any)}
    >
      <div className="flex items-center justify-center pointer-events-none">{children}</div>
    </motion.div>
  );
};

DockIcon.displayName = "DockIcon";

export default DockIcon;
