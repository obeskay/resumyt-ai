import { createClient } from '@supabase/supabase-js';
import { VideoFetchError, TranscriptNotFoundError, SummaryGenerationError } from './errors';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function processVideo(videoUrl: string): Promise<{ videoId: string, transcript: string }> {
  try {
    // Aquí iría la lógica para procesar el video
    // Por ahora, simplemente extraemos el ID del video de YouTube
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      throw new VideoFetchError('Invalid YouTube URL');
    }

    const transcript = await transcribeVideo(videoId);
    return { videoId, transcript };
  } catch (error) {
    console.error('Error processing video:', error);
    throw new VideoFetchError('Failed to process video');
  }
}

export async function transcribeVideo(videoId: string): Promise<string> {
  try {
    // Aquí iría la lógica para transcribir el video
    // Por ahora, retornamos un texto de ejemplo
    const transcript = `This is a sample transcript for video ${videoId}`;
    if (!transcript) {
      throw new TranscriptNotFoundError('Failed to generate transcript');
    }
    return transcript;
  } catch (error) {
    console.error('Error transcribing video:', error);
    throw new TranscriptNotFoundError('Failed to transcribe video');
  }
}

export async function generateSummary(transcript: string): Promise<string> {
  try {
    // Aquí iría la lógica para generar el resumen
    // Por ahora, retornamos un resumen de ejemplo
    const summary = `This is a sample summary of the transcript: ${transcript.substring(0, 50)}...`;
    if (!summary) {
      throw new SummaryGenerationError('Failed to generate summary');
    }
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new SummaryGenerationError('Failed to generate summary');
  }
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
