import React from 'react';
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({ children, className }) => {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-secondary to-secondary-foreground text-transparent bg-clip-text",
        className
      )}
    >
      {children}
    </span>
  );
};