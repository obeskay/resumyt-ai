import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface YouTubeLogoProps {
  className?: string;
}

const YouTubeLogo: React.FC<YouTubeLogoProps> = ({ className }) => (
  <Image
    src="./../../youtube-logo.svg"
    alt="YouTube logo"
    width={24}
    height={24}
    className={cn("fill-current text-primary", className)}
    aria-hidden="true"
  />
);

export default YouTubeLogo;
