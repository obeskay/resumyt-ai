import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Define the possible status types
type StatusType = "error" | "processing" | "success";

interface LoadingAnimationProps {
  status: StatusType;
  progress?: number;
}

export function LoadingAnimation({
  status,
  progress = 0,
}: LoadingAnimationProps) {
  const { rive, RiveComponent } = useRive({
    src: "/animations/video_processing.riv",
    stateMachines: "Processing",
    autoplay: true,
  });

  const container = useRef<HTMLDivElement>(null);
  const stateInput = useRef<HTMLInputElement>(null);
  const progressInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Convert status to a number value for Lottie
    const statusValue = {
      processing: 0,
      success: 1,
      error: 2,
    }[status];

    if (stateInput?.current) stateInput.current.value = statusValue.toString();
    if (progressInput?.current)
      progressInput.current.value = progress.toString();
  }, [status, progress]);

  const steps = {
    processing: [
      { step: "Analizando video", progress: 0.2 },
      { step: "Extrayendo transcripción", progress: 0.4 },
      { step: "Procesando contenido", progress: 0.6 },
      { step: "Generando resumen", progress: 0.8 },
      { step: "Finalizando", progress: 1.0 },
    ],
    success: [{ step: "¡Resumen completado!", progress: 1 }],
    error: [{ step: "Error en el proceso", progress: 0 }],
  };

  const currentSteps = steps[status];
  const currentStep = Math.floor(progress * currentSteps.length);

  return (
    <div className="w-full max-w-md mx-auto">
      <RiveComponent className="w-full h-64" />

      <div className="mt-6">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute h-full bg-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="mt-4 space-y-2">
          {currentSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: index <= currentStep ? 1 : 0.5,
                x: 0,
              }}
              className="flex items-center space-x-3"
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  index < currentStep
                    ? "bg-green-500"
                    : index === currentStep
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-300"
                }`}
              />
              <span className="text-sm text-gray-600">{step.step}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
