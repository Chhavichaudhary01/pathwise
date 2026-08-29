import * as React from "react";
import { cn } from "@/lib/utils";

export interface ShineBorderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * Border radius in pixels
   * @default 16
   */
  borderRadius?: number;
  /**
   * Width of the border in pixels
   * @default 1.5
   */
  borderWidth?: number;
  /**
   * Duration of the animation in seconds
   * @default 14
   */
  duration?: number;
  /**
   * Color or array of colors for the shine gradient
   * @default ["#5051F9", "#06B6D4", "#10B981"]
   */
  color?: string | string[];
  shineColor?: string | string[];
  children?: React.ReactNode;
}

/**
 * Shine Border (21st.dev / Magic UI component)
 * An animated background border shine effect component using hardware-accelerated gradients.
 */
export const ShineBorder: React.FC<ShineBorderProps> = ({
  borderRadius = 16,
  borderWidth = 1.5,
  duration = 14,
  color,
  shineColor = ["#5051F9", "#06B6D4", "#10B981"],
  className,
  children,
  style,
  ...props
}) => {
  const activeColor = color || shineColor;
  const gradientStops = Array.isArray(activeColor)
    ? activeColor.join(",")
    : activeColor;

  return (
    <div
      style={{
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* Rotating Conic Shine Gradient Pseudo-border */}
      <div
        style={
          {
            "--border-width": `${borderWidth}px`,
            "--duration": `${duration}s`,
            borderRadius: `${borderRadius}px`,
            backgroundImage: `radial-gradient(transparent, transparent, ${gradientStops}, transparent, transparent)`,
            backgroundSize: "300% 300%",
            mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            padding: "var(--border-width)",
          } as React.CSSProperties
        }
        className="motion-safe:animate-shine pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] z-0"
      />

      {/* Inner Card Content */}
      <div className="relative z-10 size-full">{children}</div>
    </div>
  );
};

export default ShineBorder;
