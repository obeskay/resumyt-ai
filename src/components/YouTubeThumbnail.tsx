import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface YouTubeThumbnailProps {
  src: string;
  alt: string;
  layoutId: string;
}

const YouTubeThumbnail: React.FC<YouTubeThumbnailProps> = ({ src, alt, layoutId }) => {
  return (
    <motion.div
      className="relative w-full aspect-video"
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 28.57 20"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <clipPath id="youtube-clip">
            <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z" />
          </clipPath>
        </defs>
        <foreignObject width="100%" height="100%" clipPath="url(#youtube-clip)">
          <Image
            src={src}
            alt={alt}
            layout="fill"
            objectFit="cover"
          />
        </foreignObject>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-white opacity-80"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </motion.div>
  );
};

export default YouTubeThumbnail;