import React, { createContext, useContext } from "react";
import { motion, useMotionValue, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface DockContextType {
  mouseX: MotionValue<number>;
  size: number;
  magnification: number;
  distance: number;
  disableMagnification: boolean;
}

export const DockContext = createContext<DockContextType | null>(null);

export const useDock = () => {
  return useContext(DockContext);
};

export interface DockProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  size?: number;
  iconSize?: number;
  magnification?: number;
  iconMagnification?: number;
  distance?: number;
  iconDistance?: number;
  direction?: "top" | "middle" | "bottom";
  disableMagnification?: boolean;
  children: React.ReactNode;
}

const DEFAULT_SIZE = 44;
const DEFAULT_MAGNIFICATION = 68;
const DEFAULT_DISTANCE = 140;

export const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      size,
      iconSize = DEFAULT_SIZE,
      magnification,
      iconMagnification,
      distance,
      iconDistance,
      direction = "middle",
      disableMagnification = false,
      ...props
    },
    ref
  ) => {
    const activeSize = size ?? iconSize;
    const activeMagnification = magnification ?? iconMagnification ?? DEFAULT_MAGNIFICATION;
    const activeDistance = distance ?? iconDistance ?? DEFAULT_DISTANCE;

    const mouseX = useMotionValue(Infinity);

    return (
      <DockContext.Provider
        value={{
          mouseX,
          size: activeSize,
          magnification: activeMagnification,
          distance: activeDistance,
          disableMagnification,
        }}
      >
        <motion.div
          ref={ref}
          onMouseMove={(e) => mouseX.set(e.clientX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className={cn(
            "flex h-[66px] w-max items-center justify-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/80 px-3 py-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 pointer-events-auto",
            {
              "items-start": direction === "top",
              "items-center": direction === "middle",
              "items-end": direction === "bottom",
            },
            className
          )}
          {...(props as any)}
        >
          {children}
        </motion.div>
      </DockContext.Provider>
    );
  }
);

Dock.displayName = "Dock";

export default Dock;
