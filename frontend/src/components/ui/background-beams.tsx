import React from "react";
import { cn } from "@/lib/utils";

export interface BackgroundBeamsProps {
  className?: string;
  children?: React.ReactNode;
}

export const BackgroundBeams: React.FC<BackgroundBeamsProps> = ({
  className,
  children,
}) => {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      {/* Background Mesh Grid & Ambient Gradient Mask */}
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-70 dark:opacity-40" />

      {/* Ambient Conic/Radial Glow Orbs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 z-0 h-[450px] w-[700px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-cyan-500/10 blur-[120px]" />
      
      {/* Interactive Content Layer */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default BackgroundBeams;
