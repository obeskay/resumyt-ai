import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import { supabase } from "@/lib/supabaseClient";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { videoId, language, count = 3 } = req.body; // Valor por defecto de 3

    // Obtener el resumen del video de Supabase
    const { data: summaryData, error: summaryError } = await supabase
      .from("summaries")
      .select("content")
      .eq("video_id", videoId)
      .single();

    if (summaryError || !summaryData) {
      throw new Error("Failed to fetch summary");
    }

    const prompt = `Based on the following video summary, generate ${count} relevant but short questions that could be asked about the content. The questions should be in ${
      language === "es" ? "Spanish" : "English"
    } and include emojis.

Summary: ${summaryData.content}

Generate ${count} questions:`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const generatedQuestions = response.choices[0].message?.content
      ?.split("\n")
      .filter((q: string) => q.trim() !== "")
      .map((q: string) => q.replace(/^\d+\.\s*/, "").trim())
      .slice(0, count); // Aseguramos que solo devolvemos el número de preguntas solicitadas

    return res.status(200).json({ questions: generatedQuestions });
  } catch (error) {
    console.error("Error generating questions:", error);
    return res.status(500).json({ error: "Failed to generate questions" });
  }
}
