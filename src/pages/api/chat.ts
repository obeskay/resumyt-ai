import { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";

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

const getSystemPrompt = (language: string, context: string, questions: any) => {
  const questionsContext = questions?.questions
    ? `\n\nPreguntas sugeridas y sus respuestas correctas:\n${questions.questions
        .map(
          (q: any, i: number) =>
            `${i + 1}. ${q.question}\nRespuesta correcta: ${
              q.correct_answer
            }\nExplicación: ${q.explanation}`,
        )
        .join("\n\n")}`
    : "";

  return language === "es"
    ? `Eres un asistente AI que responde preguntas sobre un video de YouTube. Responde de manera concisa pero completa, usando emojis y viñetas cuando sea apropiado. Responde en español. Usa el siguiente contexto para responder:\n\n${context}${questionsContext}`
    : `You are an AI assistant that answers questions about a YouTube video. Respond concisely but comprehensively, using emojis and bullet points when appropriate. Respond in English. Use the following context to answer:\n\n${context}${questionsContext}`;
};

export default async function handler(req: NextRequest) {
  const { messages, videoId, language } = await req.json();

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("summaries")
    .select("transcript, content, suggested_questions")
    .eq("video_id", videoId)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch video data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { transcript, content: summary, suggested_questions } = data;
  const context = `Summary: ${summary}\n\nTranscript: ${transcript}`;

  const systemMessage = getSystemPrompt(language, context, suggested_questions);

  // Generar preguntas sugeridas si es el primer mensaje
  if (messages.length === 0) {
    const suggestedQuestionsPrompt =
      language === "es"
        ? "Genera 3 preguntas sugeridas específicas sobre el contenido de este video, incluyendo emojis relevantes. Responde solo con las preguntas, una por línea."
        : "Generate 3 suggested questions specific to this video content, including relevant emojis. Respond only with the questions, one per line.";

    try {
      const suggestedQuestionsResponse = await openai.chat.completions.create({
        model: "openai/gpt-4-turbo",
        messages: [
          { role: "system", content: systemMessage },
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
    } catch (error) {
      console.error("Error generating suggested questions:", error);
      return new Response(
        JSON.stringify({ error: "Failed to generate suggested questions" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  const apiMessages = [{ role: "system", content: systemMessage }, ...messages];

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: apiMessages,
      stream: true,
      max_tokens: 500,
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error("Error in chat completion:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
