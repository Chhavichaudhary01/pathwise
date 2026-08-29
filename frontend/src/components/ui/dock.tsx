import React from "react";
import { motion, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { DockIcon, type DockIconProps } from "@/components/ui/dock-icon";

export interface DockProps {
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

const DEFAULT_SIZE = 42;
const DEFAULT_MAGNIFICATION = 60;
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

    const renderChildren = () => {
      return React.Children.map(children, (child) => {
        if (React.isValidElement<DockIconProps>(child) && child.type === DockIcon) {
          return React.cloneElement(child, {
            ...child.props,
            mouseX: mouseX,
            size: activeSize,
            magnification: activeMagnification,
            distance: activeDistance,
            disableMagnification: disableMagnification,
          });
        }
        return child;
      });
    };

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        {...props}
        className={cn(
          "flex h-[62px] w-max items-center justify-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 pointer-events-auto",
          {
            "items-start": direction === "top",
            "items-center": direction === "middle",
            "items-end": direction === "bottom",
          },
          className
        )}
      >
        {renderChildren()}
      </motion.div>
    );
  }
);

Dock.displayName = "Dock";

export default Dock;
