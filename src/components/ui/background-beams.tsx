"use client";
import React from "react";
import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, motion } from "framer-motion";

export const BackgroundBeams = () => {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const currentRef = ref.current;
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX);
      mouseY.set(clientY);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouseX, mouseY]); // Añade mouseX y mouseY como dependencias

  return (
    <div
      ref={ref}
      className="h-full w-full absolute inset-0 z-0 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(100,100,100,.15), transparent 80%)`,
        }}
      />
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  );
};