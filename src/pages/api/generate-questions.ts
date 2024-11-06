import { NextApiRequest, NextApiResponse } from "next";
import { getSupabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { videoId, language, count = 5 } = req.body;

    if (!videoId || !language) {
      return res.status(400).json({
        error: "Missing required parameters",
        details: "videoId and language are required",
      });
    }

    // Obtener el resumen del video de Supabase
    const supabase = getSupabase();
    const { data: summaryData, error: summaryError } = await supabase
      .from("summaries")
      .select("content")
      .eq("video_id", videoId)
      .single();

    if (summaryError || !summaryData) {
      return res.status(400).json({
        error: "Failed to fetch summary",
        details: summaryError?.message,
      });
    }

    const prompt = `Based on the following video summary, generate ${count} relevant questions that could be asked about the content. The questions should be in ${
      language === "es" ? "Spanish" : "English"
    } and include emojis.

Summary: ${summaryData.content}

Generate ${count} questions:`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedQuestions = response.choices[0].message?.content
      ?.split("\n")
      .filter((q: string) => q.trim() !== "")
      .map((q: string) => q.replace(/^\d+\.\s*/, "").trim())
      .slice(0, count);

    if (!generatedQuestions || generatedQuestions.length === 0) {
      throw new Error("No questions were generated");
    }

    // Formatear las preguntas como objetos
    const formattedQuestions = generatedQuestions.map((question) => ({
      question,
      type: "suggested",
    }));

    return res.status(200).json({
      questions: formattedQuestions,
      count: formattedQuestions.length,
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    return res.status(500).json({
      error: "Failed to generate questions",
      details: error.message,
    });
  }
}
