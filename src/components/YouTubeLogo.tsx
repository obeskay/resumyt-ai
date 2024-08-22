import React from "react";
import Image from "next/image";

const YouTubeLogo: React.FC = () => (
  <Image
    src="/youtube-logo.svg"
    alt="YouTube logo"
    width={24}
    height={24}
    className="ml-2"
    aria-hidden="true"
  />
);

export default YouTubeLogo;
