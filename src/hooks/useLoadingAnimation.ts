import { useState, useEffect } from "react";

const animations = {
  writing: "/animations/writing.riv",
  processing: "/animations/processing.riv",
  success: "/animations/success.riv",
};

export const useLoadingAnimation = () => {
  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "processing" | "success">("idle");

  useEffect(() => {
    switch (stage) {
      case "processing":
        setCurrentAnimation(animations.writing);
        break;
      case "success":
        setCurrentAnimation(animations.success);
        break;
      default:
        setCurrentAnimation(null);
    }
  }, [stage]);

  return {
    currentAnimation,
    setStage,
    stage,
  };
};
