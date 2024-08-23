import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClientComponentClient<Database>();
};

export const getSupabase = createClient;

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function ensureVideoExists(supabase: ReturnType<typeof createClient>, videoUrl: string, userId: string) {
  const videoId = extractYouTubeId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }

  // First, try to get the existing video
  let { data: existingVideo, error: selectError } = await supabase
    .from('videos')
    .select('id')
    .eq('id', videoId)
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('Error checking for existing video:', selectError);
    throw selectError;
  }

  if (existingVideo) {
    return existingVideo.id;
  }

  // If the video doesn't exist, create it
  const { data: newVideo, error: insertError } = await supabase
    .from('videos')
    .insert({ id: videoId, url: videoUrl, user_id: userId })
    .select('id')
    .single();

  if (insertError) {
    console.error('Error creating video record:', insertError);
    throw insertError;
  }

  if (!newVideo) {
    throw new Error('Failed to create video record');
  }

  return newVideo.id;
}
