import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import OpenAI from "openai";
import { Response } from "node-fetch";
import { streamText } from "ai";

export const runtime = "edge";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

if (!OPENROUTER_API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: OPENROUTER_API_KEY,
  baseURL: OPENROUTER_BASE_URL,
});

export default async function handler(req: NextRequest) {
  const { messages, videoId, language } = await req.json();

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("summaries")
    .select("transcript, content")
    .eq("video_id", videoId)
    .single();

  if (error) {
    throw new Error("Failed to fetch video data");
  }

  const { transcript, content: summary } = data;
  const context = `Summary: ${summary}\n\nTranscript: ${transcript}`;

  const systemMessage =
    language === "es"
      ? "Eres un asistente AI que responde preguntas sobre un video de YouTube. Responde de manera concisa pero completa, usando emojis y viñetas cuando sea apropiado. Responde en español."
      : "You are an AI assistant that answers questions about a YouTube video. Respond concisely but comprehensively, using emojis and bullet points when appropriate. Respond in English.";

  // Generar preguntas sugeridas si es el primer mensaje
  if (messages.length === 0) {
    const suggestedQuestionsPrompt =
      language === "es"
        ? "Genera 3 preguntas sugeridas específicas sobre el contenido de este video, incluyendo emojis relevantes. Responde solo con las preguntas, una por línea."
        : "Generate 3 suggested questions specific to this video content, including relevant emojis. Respond only with the questions, one per line.";

    const suggestedQuestionsResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${systemMessage}\n\nContext:\n${context}`,
        },
        { role: "user", content: suggestedQuestionsPrompt },
      ],
      max_tokens: 150,
    });

    const suggestedQuestions =
      suggestedQuestionsResponse.choices[0].message?.content
        ?.split("\n")
        .filter((q: string) => q.trim() !== "") || [];

    return new Response(JSON.stringify({ suggestedQuestions }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiMessages = [
    { role: "system", content: `${systemMessage}\n\nContext:\n${context}` },
    ...messages,
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: apiMessages,
    stream: true,
    top_p: 0.1,
    max_tokens: 500,
  });

  const stream = await streamText(response as any);
  return stream;
}
