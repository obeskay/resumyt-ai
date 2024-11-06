"use client";

import {
  useMotionValue,
  motion,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const CardSpotlight = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const divRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [rect, setRect] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || !divRef.current) return;

    const updateRect = () => {
      if (!divRef.current) return;
      const { width, height } = divRef.current.getBoundingClientRect();
      setRect({ width, height });
      mouseX.set(width / 2);
      mouseY.set(height / 2);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!divRef.current) return;
      const { left, top } = divRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
    };

    const handleMouseLeave = () => {
      mouseX.set(rect.width / 2);
      mouseY.set(rect.height / 2);
    };

    updateRect();
    window.addEventListener("resize", updateRect);

    if (window.matchMedia("(min-width: 768px)").matches) {
      divRef.current.addEventListener("mousemove", handleMouseMove);
      divRef.current.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        window.removeEventListener("resize", updateRect);
        if (!divRef.current) return;
        divRef.current.removeEventListener("mousemove", handleMouseMove);
        divRef.current.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    return () => {
      window.removeEventListener("resize", updateRect);
    };
  }, [mouseX, mouseY, rect.width, rect.height]);

  return (
    <motion.div
      ref={divRef}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "bg-background/50 backdrop-blur-[2px]",
        "border border-border/50",
        "transition-colors duration-300",
        className,
      )}
      {...(props as any)}
    >
      {/* Efecto de spotlight sutil */}
      <AnimatePresence>
        {window.matchMedia("(min-width: 768px)").matches && (
          <motion.div
            layoutId="spotlight"
            className="pointer-events-none text-[hsl(var(--secondary)/0.085)] dark:text-[hsl(var(--primary)/0.15)] absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: useMotionTemplate`
          radial-gradient(
            800px circle at ${mouseX}px ${mouseY}px,
            currentColor,
            transparent 40%
            )
            `,
            }}
          />
        )}
      </AnimatePresence>

      {/* Contenido */}
      <div className="relative">{children}</div>
    </motion.div>
  );
};
