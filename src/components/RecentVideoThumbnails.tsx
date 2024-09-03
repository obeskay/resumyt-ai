import React, { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import YouTubeThumbnail from "./YouTubeThumbnail";

interface RecentVideoThumbnailsProps {
  videoIds: string[];
  dict: {
    recentVideos?: {
      thumbnailAlt?: string;
    };
  };
}

export const RecentVideoThumbnails: React.FC<RecentVideoThumbnailsProps> = ({
  videoIds,
  dict,
}) => {
  const thumbnailAlt = dict.recentVideos?.thumbnailAlt || "Video thumbnail";

  return (
    <div className="h-[50vh] md:h-[50vh] w-full flex flex-col items-center justify-center overflow-hidden">
      <MovingCards items={videoIds} thumbnailAlt={thumbnailAlt} />
    </div>
  );
};

export const MovingCards = ({
  items,
  thumbnailAlt,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: string[];
  thumbnailAlt: string;
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        scrollerRef.current?.appendChild(duplicatedItem);
      });

      // Configurar la animación con una velocidad constante
      const scrollerWidth = scrollerRef.current.scrollWidth;
      const isMobile = window.innerWidth < 768;
      const animationDuration = isMobile
        ? speed === "fast"
          ? 7
          : speed === "normal"
            ? 15
            : 30
        : speed === "fast"
          ? 15
          : speed === "normal"
            ? 30
            : 60;
      scrollerRef.current.style.setProperty(
        "--animation-duration",
        `${animationDuration}s`,
      );
      scrollerRef.current.style.setProperty(
        "--scroller-width",
        `${scrollerWidth / 2}px`,
      );
    }
  }, [speed, items]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 1.25 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        ref={containerRef}
        className={cn(
          "relative z-20 w-full overflow-hidden pointer-events-none",
          className,
        )}
      >
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background to-transparent z-10"></div>
        <ul
          ref={scrollerRef}
          className={cn(
            "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap animate-scroll",
            pauseOnHover && "hover:[animation-play-state:paused]",
            direction === "right" ? "animate-scroll-reverse" : "animate-scroll",
          )}
        >
          {items.map((videoId, idx) => (
            <li
              className="w-[210px] md:w-[420px] max-w-full flex-shrink-0 rounded-xl overflow-hidden"
              key={idx}
            >
              <YouTubeThumbnail
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                alt={thumbnailAlt}
                layoutId={`video-thumbnail-${idx}`}
              />
            </li>
          ))}
        </ul>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecentVideoThumbnails;
