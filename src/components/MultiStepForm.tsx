"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, FileText, List, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: <List className="w-6 h-6" />,
    title: "Puntos clave",
    description: "Resumen en forma de lista de puntos principales",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Párrafo",
    description: "Resumen en formato de párrafo continuo",
  },
  {
    icon: <Newspaper className="w-6 h-6" />,
    title: "Página",
    description: "Resumen detallado en formato de página",
  },
];

interface MultiStepFormProps {
  onComplete: (selectedFormat: string) => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(steps[currentStep].title.toLowerCase());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            className={`flex flex-col items-center ${
              index <= currentStep ? "text-primary" : "text-muted-foreground"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <motion.div
              className="relative"
              initial={false}
              animate={{
                scale: index === currentStep ? 1.2 : 1,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
            >
              {index < currentStep ? (
                <Check className="w-8 h-8" />
              ) : (
                step.icon
              )}
            </motion.div>
            <span className="text-sm mt-2">{step.title}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-card p-6 rounded-lg shadow-lg mb-6"
      >
        <h3 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h3>
        <p className="text-muted-foreground mb-4">{steps[currentStep].description}</p>
      </motion.div>
      <Button onClick={handleNext} className="w-full">
        {currentStep < steps.length - 1 ? "Siguiente" : "Completar"}
      </Button>
    </div>
  );
};

export default MultiStepForm;