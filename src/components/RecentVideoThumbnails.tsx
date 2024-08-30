import React from 'react';
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

interface RecentVideoThumbnailsProps {
  videoIds: string[];
}

const RecentVideoThumbnails: React.FC<RecentVideoThumbnailsProps> = ({ videoIds }) => {
  const items = videoIds.map((videoId) => ({
    quote: "",
    name: "",
    title: "",
    image: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <div className="opacity-10">
        <InfiniteMovingCards
          items={items}
          direction="right"
          speed="slow"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
};

export default RecentVideoThumbnails;