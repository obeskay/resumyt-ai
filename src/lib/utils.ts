import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "./supabaseClient";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function generateAndSaveSuggestedQuestions(
  videoId: string,
  language: string,
): Promise<string[]> {
  try {
    // Llamar a la API para generar preguntas
    const response = await fetch("/api/generate-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoId, language, count: 3 }), // Añadimos count: 3
    });

    if (!response.ok) {
      throw new Error("Failed to generate questions");
    }

    const { questions } = await response.json();

    // Guardar las preguntas generadas en Supabase
    const { error } = await supabase
      .from("summaries")
      .update({ suggested_questions: questions })
      .eq("video_id", videoId);

    if (error) {
      throw error;
    }

    return questions;
  } catch (error) {
    console.error("Error generating and saving questions:", error);
    return [];
  }
}
