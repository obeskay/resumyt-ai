import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundGradient = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative group/bg",
        className
      )}
      {...props}
    >
      <div
        className="absolute transition-all duration-300 opacity-0 -inset-px bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur-lg group-hover/bg:opacity-100 group-hover/bg:duration-200 animate-tilt"
        style={{
          backgroundSize: "200% 200%",
          animationDuration: "5s",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
};