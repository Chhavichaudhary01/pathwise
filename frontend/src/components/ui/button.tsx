import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | string;
  size?: 'default' | 'sm' | 'lg' | 'icon' | string;
  asChild?: boolean;
}

const variantStyles: Record<string, string> = {
  default: "bg-blue-600 text-white shadow hover:bg-blue-700",
  destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  outline: "border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50",
  secondary: "bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200",
  ghost: "hover:bg-slate-100 text-slate-700",
  link: "text-blue-600 underline-offset-4 hover:underline",
};

const sizeStyles: Record<string, string> = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8 text-base",
  icon: "h-9 w-9",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          variantStyles[variant as string] || variantStyles.default,
          sizeStyles[size as string] || sizeStyles.default,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
