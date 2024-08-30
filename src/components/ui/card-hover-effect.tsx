import React from "react";
import { cn } from "@/lib/utils";

export const CardHoverEffect = ({
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
        "group relative flex items-center justify-center overflow-hidden rounded-xl shadow-xl transition-all hover:shadow-2xl",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/20 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-20 transition-transform group-hover:scale-110">
        {children}
      </div>
    </div>
  );
};