import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useDock } from "@/components/ui/dock";
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

export const DockIcon: React.FC<DockIconProps> = ({
  size: propSize,
  magnification: propMagnification,
  distance: propDistance,
  disableMagnification: propDisable,
  mouseX: propMouseX,
  className,
  children,
  onClick,
  ...props
}) => {
  const dock = useDock();
  const ref = useRef<HTMLDivElement>(null);

  const fallbackMouseX = useMotionValue(Infinity);
  const activeMouseX = propMouseX ?? dock?.mouseX ?? fallbackMouseX;
  const activeSize = propSize ?? dock?.size ?? 44;
  const activeMagnification = propMagnification ?? dock?.magnification ?? 68;
  const activeDistance = propDistance ?? dock?.distance ?? 140;
  const isDisable = propDisable ?? dock?.disableMagnification ?? false;

  const distanceCalc = useTransform(activeMouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - (bounds.x + bounds.width / 2);
  });

  const targetSize = isDisable ? activeSize : activeMagnification;

  const sizeTransform = useTransform(
    distanceCalc,
    [-activeDistance, 0, activeDistance],
    [activeSize, targetSize, activeSize]
  );

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 170,
    damping: 14,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: scaleSize, height: scaleSize }}
      onClick={onClick}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-2xl bg-slate-800/80 text-slate-300 hover:text-white transition-colors duration-150 border border-slate-700/60 shadow-md p-2.5",
        className
      )}
      {...(props as any)}
    >
      <div className="flex items-center justify-center pointer-events-none w-full h-full [&>svg]:w-full [&>svg]:h-full">
        {children}
      </div>
    </motion.div>
  );
};

DockIcon.displayName = "DockIcon";

export default DockIcon;
