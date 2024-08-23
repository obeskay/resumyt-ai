"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import VideoInput from "@/components/VideoInput";
import { useVideoStore } from "@/store/videoStore";
import Image from "next/image";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const { summary } = useVideoStore();

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-foreground">
            Resum<span className="text-primary">YT</span>
          </h1>
          <Image src="/youtube-logo.svg" alt="YouTube Logo" width={80} height={40} />
        </div>

        <h2 className="text-5xl mb-8 text-center">
          <span className="gradient-text font-bold">Resume gratis</span>
          <br />
          <span className="text-foreground">videos de YouTube</span>
        </h2>

        <VideoInput />

        <div className="bg-card rounded-lg p-6 mt-8">
          <ul className="space-y-4">
            <li className="flex items-start text-muted-foreground">
              <span className="text-secondary mr-2">•</span>
              <span>
                Ahorra tiempo al obtener información relevante de videos de
                YouTube con nuestro servicio de resumen.
              </span>
            </li>
            <li className="flex items-start text-muted-foreground">
              <span className="text-secondary mr-2">•</span>
              <span>
                Obtén un resumen de los videos de YouTube que te interesen en
                segundos.
              </span>
            </li>
          </ul>
        </div>

        {summary && (
          <div className="bg-card rounded-lg p-6 mt-8">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Resumen del video:</h3>
            <p className="text-muted-foreground">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
