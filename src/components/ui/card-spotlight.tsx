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
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const backgroundTemplate = useMotionTemplate`
    radial-gradient(
      800px circle at ${mouseX}px ${mouseY}px,
      currentColor,
      transparent 40%
    )
  `;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    setIsLargeScreen(mediaQuery.matches);

    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsLargeScreen(e.matches);
    };

    mediaQuery.addEventListener("change", handleMediaQueryChange);
    return () =>
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
  }, []);

  useEffect(() => {
    const currentDiv = divRef.current;

    if (currentDiv) {
      const updateRect = () => {
        if (!currentDiv) return;
        const { width, height } = currentDiv.getBoundingClientRect();
        setRect({ width, height });
        mouseX.set(width / 2);
        mouseY.set(height / 2);
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!currentDiv) return;
        const { left, top } = currentDiv.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
      };

      const handleMouseLeave = () => {
        mouseX.set(rect.width / 2);
        mouseY.set(rect.height / 2);
      };

      updateRect();
      window.addEventListener("resize", updateRect);

      if (isLargeScreen) {
        currentDiv.addEventListener("mousemove", handleMouseMove);
        currentDiv.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          window.removeEventListener("resize", updateRect);
          if (!currentDiv) return;
          currentDiv.removeEventListener("mousemove", handleMouseMove);
          currentDiv.removeEventListener("mouseleave", handleMouseLeave);
        };
      }

      return () => {
        window.removeEventListener("resize", updateRect);
      };
    }
  }, [divRef, mouseX, mouseY, rect.width, rect.height, isLargeScreen]);

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
      {/* Spotlight effect */}
      <AnimatePresence>
        {isLargeScreen && (
          <motion.div
            layoutId="spotlight"
            className="pointer-events-none text-[hsl(var(--secondary-foreground)/0.075)] dark:text-[hsl(var(--secondary)/0.1)] absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: backgroundTemplate,
            }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative">{children}</div>
    </motion.div>
  );
};
