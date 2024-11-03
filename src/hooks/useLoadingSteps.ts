import { useEffect } from "react";
import { useLoadingStore } from "@/store/loadingStore";

export function useLoadingSteps(isLoading: boolean) {
  const { setCurrentStep, progress } = useLoadingStore();

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    // Definir los umbrales de progreso para cada paso
    if (progress <= 25) {
      setCurrentStep(0); // Analyzing video
    } else if (progress <= 50) {
      setCurrentStep(1); // Extracting key information
    } else if (progress <= 75) {
      setCurrentStep(2); // Generating summary
    } else {
      setCurrentStep(3); // Finishing up
    }
  }, [progress, isLoading, setCurrentStep]);
}
