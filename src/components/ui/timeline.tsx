"use client";
import {
  useMotionValueEvent,
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 20%", "end 50%"],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0.05, 1]);

  return (
    <div className="w-full relative" ref={containerRef}>
      <div ref={ref} className="relative max-w-7xl mx-auto ">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start md:gap-10 py-8">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-[64px] py-4">
              <div className="md:mt-3 h-10 absolute left-0 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center p-2">
                <div className="h-full w-auto aspect-square rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700" />
              </div>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden px-3 block text-xl md:text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <motion.div
          style={{
            scaleY,
            originY: 0,
          }}
          className="absolute md:left-8 left-5 top-0 w-[2px] h-full bg-gradient-to-b from-primary via-primary to-orange-500"
        />
      </div>
    </div>
  );
};
