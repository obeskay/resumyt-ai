import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const YouTubeLogo: React.FC = ({ className }: { className?: string }) => (
  <Image
    src="/youtube-logo.svg"
    alt="YouTube logo"
    width={24}
    height={24}
    className={cn("fill-current text-primary", className)}
    aria-hidden="true"
  />
);

export default YouTubeLogo;
