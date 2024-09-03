import React, { useState, useEffect } from "react";
import {
  motion,
  useInView,
  useAnimation,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
  animate,
} from "framer-motion";
import { TextGenerateEffect } from "./text-generate-effect";
import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradientClassName?: string;
  seoText?: string;
  useTextGenerate?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = "",
  gradientClassName = "from-secondary-foreground to-secondary",
  seoText,
  useTextGenerate = false,
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  const hitboxRef = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const controls = useAnimation();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (hitboxRef.current) {
        const rect = hitboxRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setMousePosition({
          x: (x / rect.width) * 100,
          y: (y / rect.height) * 100,
        });
      }
    };

    const handleMouseLeave = () => {
      setMousePosition({ x: 50, y: 50 });
    };

    const hitboxElement = hitboxRef.current;
    if (hitboxElement) {
      hitboxElement.addEventListener("mousemove", handleMouseMove);
      hitboxElement.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        hitboxElement.removeEventListener("mousemove", handleMouseMove);
        hitboxElement.removeEventListener("mouseleave", handleMouseLeave);
      };
    }
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5 },
      });
    }
  }, [isInView, controls]);

  const x = useMotionValue(0);
  const animateX = useSpring(x, { stiffness: 400, damping: 80 });

  useMotionValueEvent(animateX, "change", (latest) => {
    setMousePosition({ x: latest, y: 0 });
  });

  const handleViewportEnter = () => {
    animate(x, 100, { duration: 1 });
  };

  const renderChildren = () => {
    if (useTextGenerate && typeof children === "string") {
      return <span className="text-transparent">{children}</span>;
    } else if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: cn((children.props as any).className, "text-transparent"),
      } as any);
    } else {
      return children;
    }
  };

  return (
    <motion.span
      ref={ref}
      className={cn(
        "relative inline-block bg-clip-text text-transparent",
        className,
        gradientClassName,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      style={{
        backgroundImage: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 50%)`,
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      transition={{ duration: 0.3 }}
      onViewportEnter={handleViewportEnter}
    >
      <span
        ref={hitboxRef}
        className="absolute inset-0 -my-8 -mx-24 z-10"
        aria-hidden="true"
      />
      {seoText && <span className="sr-only">{seoText}</span>}
      {isInView ? renderChildren() : children}
    </motion.span>
  );
};
