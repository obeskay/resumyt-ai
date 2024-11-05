import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { rateLimit } from "@/lib/rateLimit";

interface ErrorResponse {
  error: string;
  details?: string;
}

function createErrorResponse(
  message: string,
  details?: string,
  status: number = 500,
): NextResponse<ErrorResponse> {
  return NextResponse.json({ error: message, details }, { status });
}

export const runtime = "edge";

const getSystemPrompt = (language: string) => {
  return language === "es"
    ? "Eres un asistente que genera preguntas de opción múltiple basadas en resúmenes de videos. Siempre responde con JSON correctamente formateado. Las preguntas y respuestas deben estar en español."
    : "You are a helpful assistant that generates multiple choice questions based on video summaries. Always respond with properly formatted JSON. Questions and answers should be in English.";
};

const getQuestionPrompt = (language: string, summary: string) => {
  return language === "es"
    ? `Basado en el siguiente resumen de video, genera 5 preguntas de opción múltiple con 4 opciones cada una. Formatea la respuesta en JSON con la siguiente estructura:
    {
      "questions": [
        {
          "question": "¿Texto de la pregunta aquí?",
          "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
          "correct_answer": "Opción A",
          "explanation": "Breve explicación de por qué esta es la respuesta correcta"
        }
      ]
    }
    
    Resumen: ${summary}`
    : `Based on the following video summary, generate 5 multiple choice questions with 4 options each. Format the response in JSON with the following structure:
    {
      "questions": [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A",
          "explanation": "Brief explanation of why this is the correct answer"
        }
      ]
    }
    
    Summary: ${summary}`;
};

export default async function handler(req: NextRequest) {
  try {
    // Rate limiting check
    const rateLimitResult = await rateLimit(req);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Get URL parameters
    const url = new URL(req.url);
    const videoId = url.searchParams.get("videoId");
    const language = url.searchParams.get("lang") || "en";

    if (!videoId) {
      return createErrorResponse("Video ID is required", undefined, 400);
    }

    const supabase = getSupabase();
    const ip = req.ip ?? "::1";

    // Get user
    const { data: user, error: userError } = await supabase.rpc(
      "get_or_create_anonymous_user",
      {
        user_ip: ip,
        initial_quota: 5,
        initial_plan: "F",
      },
    );

    if (userError) {
      console.error("Error getting/creating user:", userError);
      return createErrorResponse("Error processing request");
    }

    // Get the summary for the video
    const { data: summary, error: summaryError } = await supabase
      .from("summaries")
      .select("content, id")
      .eq("video_id", videoId)
      .eq("user_id", user.id)
      .single();

    if (summaryError || !summary) {
      return createErrorResponse(
        "Summary not found",
        "No summary found for this video",
        404,
      );
    }

    // Generate questions using OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: getSystemPrompt(language),
          },
          {
            role: "user",
            content: getQuestionPrompt(language, summary.content),
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate questions");
    }

    const aiResponse = await response.json();
    const questions = JSON.parse(aiResponse.choices[0].message.content);

    // Update the summary with the generated questions
    const { error: updateError } = await supabase
      .from("summaries")
      .update({
        suggested_questions: questions,
      })
      .eq("id", summary.id);

    if (updateError) {
      console.error("Failed to save questions:", updateError);
      return createErrorResponse("Failed to save questions");
    }

    return NextResponse.json(
      { questions: questions },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  } catch (error) {
    console.error("Error generating questions:", error);
    return createErrorResponse(
      "Error generating questions",
      error instanceof Error ? error.message : "Unknown error",
      500,
    );
  }
}
