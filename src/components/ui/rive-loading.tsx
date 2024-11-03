import React, { useEffect } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";
import { motion } from "framer-motion";
import { useLoadingStore } from "@/store/loadingStore";

interface RiveLoadingAnimationProps {
  dict: any;
}

export const RiveLoading: React.FC<RiveLoadingAnimationProps> = ({ dict }) => {
  const { progress, currentStep } = useLoadingStore();
  const { rive, RiveComponent } = useRive({
    src: "/animations/loading_wizard.riv",
    stateMachines: "State Machine",
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
  });

  useEffect(() => {
    if (rive) {
      const progressInput = rive
        .stateMachineInputs("State Machine")
        .find((input) => input.name === "progress");
      if (progressInput) {
        progressInput.value = progress;
      }
    }
  }, [rive, progress]);

  const steps = [
    dict.loading?.step1 ?? "Analyzing video",
    dict.loading?.step2 ?? "Extracting key information",
    dict.loading?.step3 ?? "Generating summary",
    dict.loading?.step4 ?? "Finishing up",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="w-96 h-96 relative">
        <RiveComponent />
        <motion.div
          className="absolute bottom-0 left-0 right-0 text-center space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold">
            {dict.loading?.title ?? "Generating Summary"}
          </h3>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0.5 }}
                animate={{
                  opacity: currentStep === index ? 1 : 0.5,
                  scale: currentStep === index ? 1.05 : 1,
                }}
                className={`text-sm ${
                  currentStep === index
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step}
              </motion.div>
            ))}
          </div>
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto mt-4">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-muted-foreground">{progress}%</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
