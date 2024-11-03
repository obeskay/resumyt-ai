import { useState, useEffect } from "react";

interface UseLoadingProgressProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function useLoadingProgress({
  isLoading,
  onComplete,
}: UseLoadingProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress >= 100) {
        clearInterval(interval);
        onComplete?.();
        return;
      }

      // Simular progreso no lineal para una experiencia más realista
      const increment =
        Math.random() * 2 +
        (currentProgress < 30
          ? 5
          : currentProgress < 70
            ? 3
            : currentProgress < 90
              ? 1
              : 0.5);

      currentProgress = Math.min(currentProgress + increment, 100);
      setProgress(Math.round(currentProgress));
    }, 200);

    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  return progress;
}
