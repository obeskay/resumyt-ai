import { motion, AnimatePresence } from "framer-motion";
import { LoadingAnimation } from "./LoadingAnimation";
import { useRouter } from "next/navigation";

interface VideoProcessingStateProps {
  status: "processing" | "success" | "error";
  progress?: number;
  videoId?: string;
  language?: string;
  error?: string;
}

export function VideoProcessingState({
  status,
  progress = 0,
  videoId,
  language = "es",
  error,
}: VideoProcessingStateProps) {
  const router = useRouter();

  const statusMessages = {
    processing: {
      es: "Procesando tu video...",
      en: "Processing your video...",
    },
    success: {
      es: "¡Resumen generado exitosamente!",
      en: "Summary successfully generated!",
    },
    error: {
      es: "Ocurrió un error",
      en: "An error occurred",
    },
  };

  const handleViewSummary = () => {
    if (videoId) {
      router.push(`/${language}/summary/${videoId}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-lg w-full mx-4 shadow-xl"
        >
          <LoadingAnimation status={status} progress={progress} />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-4 text-gray-600 dark:text-gray-300"
          >
            {statusMessages[status][language as "es" | "en"]}
          </motion.p>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center mt-2 text-sm"
            >
              {error}
            </motion.p>
          )}

          {status === "success" && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleViewSummary}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {language === "es" ? "Ver Resumen" : "View Summary"}
            </motion.button>
          )}

          {status === "error" && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
            >
              {language === "es" ? "Intentar Nuevamente" : "Try Again"}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
