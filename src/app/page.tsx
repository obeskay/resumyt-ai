"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import VideoInput from "@/components/VideoInput";
import { useVideoStore } from "@/store/videoStore";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { summary, userQuotaRemaining } = useVideoStore();

  useEffect(() => {
    // Any initialization logic if needed
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-gray-100 dark:to-gray-900 text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="flex justify-between items-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold">
            Resum<span className="text-primary">YT</span>
          </h1>
          <div className="flex items-center">
            <span className="mr-2 text-sm">
              {theme === "dark" ? "Dark" : "Light"}
            </span>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
            />
          </div>
        </motion.div>

        <motion.h2
          className="text-5xl mb-8 text-center w-auto mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="gradient-text font-bold">Resume gratis</span>
          <br />
          videos de YouTube
        </motion.h2>

        <VideoInput />

        <AnimatePresence>
          {summary && (
            <motion.div
              className="bg-card rounded-lg p-6 mb-12 mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-4">Resumen del video:</h3>
              <p>{summary}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="bg-card rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>
                Ahorra tiempo al obtener información relevante de videos de
                YouTube con nuestro servicio de resumen.
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>
                Obtén un resumen de los videos de YouTube que te interesen en
                segundos.
              </span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Resúmenes restantes: {userQuotaRemaining}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
