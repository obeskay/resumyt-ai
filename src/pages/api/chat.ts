import type { NextApiRequest, NextApiResponse } from "next";
import { getSupabase } from "@/lib/supabase";
import OpenAI from "openai";
import { clientIp, rateLimit } from "@/lib/rateLimit";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const limited = await rateLimit(clientIp(req));
  if (limited) return res.status(limited.status).json(await limited.json());

  const { messages, videoId, language } = req.body;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("summaries")
    .select("transcript, content, suggested_questions")
    .eq("video_id", videoId)
    .single();

  if (error) {
    return res.status(500).json({ error: "Failed to fetch video data" });
  }

  const { transcript, content: summary, suggested_questions } = data;
  const context = `Summary: ${summary}\n\nTranscript: ${transcript}`;

  const systemMessage = getSystemPrompt(language, context, suggested_questions);
  const apiMessages = [{ role: "system", content: systemMessage }, ...messages];

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: apiMessages,
      stream: true,
      max_tokens: 500,
    });

    // The client went away: stop generating tokens nobody will read.
    res.on("close", () => response.controller.abort());
    // no-transform keeps the server's gzip from holding the text until the end.
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    });
    for await (const chunk of response) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) res.write(text);
    }
    res.end();
  } catch (error) {
    console.error("Error in chat completion:", error);
    // Mid-stream, cut the connection so the client reports the error.
    if (res.headersSent) return res.destroy();
    res.status(500).json({ error: "Failed to generate response" });
  }
}
