import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface YouTubeThumbnailProps {
  src: string;
  alt: string;
  layoutId?: string;
  videoId?: string;
  title?: string;
  thumbnailUrl?: string;
}

const YouTubeThumbnail: React.FC<YouTubeThumbnailProps> = ({
  src,
  alt,
  layoutId,
  videoId,
  title,
  thumbnailUrl,
}) => {
  return (
    <motion.div
      layoutId={layoutId}
      className="relative w-full pt-[56.25%]" // Aspect ratio 16:9
    >
      <Image
        src={src || thumbnailUrl || ""}
        alt={alt || title || "Video thumbnail"}
        layout="fill"
        objectFit="cover"
        className="rounded-xl absolute top-0 left-0 w-full h-full"
      />
    </motion.div>
  );
};

export default YouTubeThumbnail;
