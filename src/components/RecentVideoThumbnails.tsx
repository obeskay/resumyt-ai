import React, { useEffect, useCallback } from "react";
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
    <div className="h-[50vh] w-full flex flex-col items-center justify-center overflow-hidden">
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const [start, setStart] = React.useState(false);

  useEffect(() => {
    const addAnimation = () => {
      if (containerRef.current && scrollerRef.current) {
        const scrollerContent = Array.from(scrollerRef.current.children);

        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          if (scrollerRef.current) {
            scrollerRef.current.appendChild(duplicatedItem);
          }
        });

        setStart(true);
      }
    };

    addAnimation();
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        ref={containerRef}
        className={cn("relative z-20 w-full overflow-hidden", className)}
      >
        <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent z-10"></div>
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background to-transparent z-10"></div>
        <ul
          ref={scrollerRef}
          className={cn(
            "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
            start && "animate-scroll animate-ease-linear",
            pauseOnHover && "hover:[animation-play-state:paused]",
          )}
        >
          {items.map((videoId, idx) => (
            <li
              className="w-[420px] max-w-full flex-shrink-0 rounded-xl overflow-hidden"
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
